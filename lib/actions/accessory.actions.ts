'use server';

import {prisma} from "@/app/db";
import {parseStringify, processRecordContents} from "@/lib/utils";
import {auth} from "@/auth";
import {z} from "zod";
import {accessorySchema, assignmentSchema} from "@/lib/schemas";
import {revalidatePath} from "next/cache";

type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export const create = async (values: z.infer<typeof accessorySchema>) => {
    try {

        const validation = accessorySchema.safeParse(values);
        if (!validation.success) {
            return {error: validation.error.errors[0].message};
        }
        const session = await auth()
        if (!session) {
            return {error: "Not authenticated"};
        }
        await prisma.accessory.create({
                data: {
                    name: values.name,
                    purchaseDate: values.purchaseDate,
                    endOfLife: values.endOfLife || '',
                    alertEmail: values.alertEmail,
                    modelId: values.modelId,
                    statusLabelId: values.statusLabelId,
                    departmentId: values.departmentId,
                    locationId: values.locationId,
                    price: values.price,
                    companyId: session?.user.companyId,
                    reorderPoint: values.reorderPoint,
                    totalQuantityCount: values.totalQuantityCount,
                    material: values.material || '',
                    weight: values.weight!,
                    supplierId: values.supplierId,
                    inventoryId: values.inventoryId,
                    poNumber: values.poNumber,
                    notes: values.notes
                },
            }
        );
    } catch
        (error) {
        console.error('Error creating asset:', error);
    }
}


export const getAll = async (): Promise<ApiResponse<Accessory[]>> =>{
    try {

        const session = await auth();
        if (!session?.user?.companyId) {
            return {error: 'Unauthorized access'};
        }
        const accessories = await prisma.accessory.findMany({
            include: {
                company: true,
                supplier: true,
                inventory: true
            },
            where: {
                companyId: session.user.companyId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {data: parseStringify(accessories)};
    } catch (error) {
        console.error('Error fetching accessories:', error);
        return {error: 'Failed to fetch assets'};
    }
}

export const findById = async (id: string): Promise<ApiResponse<Accessory>> => {
    try {
        const accessory = await prisma.accessory.findUnique({
            where: {
                id: id
            },
            include: {
                company: true,
                supplier: true,
                inventory: true,
                statusLabel: true,
                model: {
                    include: {
                        category: true,
                        manufacturer: true
                    }
                },
                department: true,
                departmentLocation: true,
                assignee: true,

            }
        });

        if (!accessory) {
            return {
                error: 'Accessory not found',
            };
        }

        return {
            data: parseStringify(accessory),
        };
    } catch (error) {
        console.error('Error finding accessory:', error);
        return {
            error: 'Failed to find accessory',
        };
    }
}

export const remove = async (id: string) => {
    try {
        const asset = await prisma.accessory.delete({
            where: {
                id: id
            }
        })
        return parseStringify(asset);
    } catch (error) {
        console.log(error)
    }
}

export const update = async (asset: Accessory, id: string) => {
    try {
        // const assets = await prisma.asset.update({
        //     where: {
        //         id: id
        //     },
        //     data: {
        //         ...asset
        //     }
        // });
        // return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}

export async function processAccessoryCSV(csvContent: string) {
    try {
        const data = processRecordContents(csvContent);
        const session = await auth();

        // if (!session?.user?.companyId) {
        //     throw new Error('User session or company ID is invalid.');
        // }

        // const companyId = session.user.companyId;
        const companyId = 'bf40528b-ae07-4531-a801-ede53fb31f04';

        const records = await prisma.$transaction(async (tx) => {
            const recordPromises = data.map(async (item) => {
                // Fetch associations
                const [model, statusLabel, supplier, location, department, inventory] = await Promise.all([
                    tx.model.findFirst({where: {name: item['model']}}),
                    tx.statusLabel.findFirst({where: {name: item['statusLabel']}}),
                    tx.supplier.findFirst({where: {name: item['supplier']}}),
                    tx.departmentLocation.findFirst({where: {name: item['location']}}),
                    tx.department.findFirst({where: {name: item['department']}}),
                    tx.inventory.findFirst({where: {name: item['inventory']}}),
                ]);

                // // Validate required associations
                if (!model || !statusLabel || !supplier) {
                    console.warn(
                        `Skipping record: Missing required associations for model="${item['model']}", statusLabel="${item['statusLabel']}", supplier="${item['supplier']}"`
                    );
                    return null;
                }

                // Create accessory record
                return tx.accessory.create({
                    data: {
                        name: item['name'],
                        purchaseDate: item['purchaseDate'],
                        endOfLife: item['endOfLife'],
                        alertEmail: item['alertEmail'],
                        modelId: model?.id,
                        statusLabelId: statusLabel?.id,
                        departmentId: department?.id || null,
                        locationId: location?.id || null,
                        price: parseFloat(item['price']) || 0,
                        companyId,
                        reorderPoint: Number(item['reorderPoint']) || 0,
                        totalQuantityCount: Number(item['totalQuantityCount']) || 0,
                        material: item['material'],
                        weight: item['weight'],
                        supplierId: supplier?.id,
                        inventoryId: inventory?.id || null,
                        poNumber: item['poNumber'],
                        notes: item['notes'],
                    },
                });
            });

            // Revalidate the necessary path
            revalidatePath('/accessories')

            // Resolve and filter out null results
            return (await Promise.all(recordPromises)).filter(Boolean);
        });

        // Revalidate the necessary path
        revalidatePath('/assets');

        return {
            success: true,
            message: `Successfully processed ${records.length} records`,
            data: records,
        };
    } catch (error) {
        console.error('Error processing CSV:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process CSV file',
        };
    }
}

export async function assign(values: z.infer<typeof assignmentSchema>): Promise<ApiResponse<Asset>> {
    try {
        const validation = assignmentSchema.safeParse(values);

        if (!validation.success) {
            return {error: validation.error.errors[0].message};
        }

        const updateResult = await prisma.accessory.update({
            where: {id: values.itemId},
            data: {assigneeId: values.userId},
        });
        console.log(updateResult)

        return {data: parseStringify(updateResult)};

    } catch (error) {
        console.error('Error assigning Accessory:', error);
        return {error: 'Failed to assign Accessory'};
    }
}
