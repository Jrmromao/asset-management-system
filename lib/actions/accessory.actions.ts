'use server';

import {prisma} from "@/app/db";
import {parseStringify, processRecordContents} from "@/lib/utils";
import {auth} from "@/auth";
import {z} from "zod";
import {accessorySchema, assetAssignSchema} from "@/lib/schemas";
import {revalidatePath} from "next/cache";


export const create = async (values: z.infer<typeof accessorySchema>) => {
    try {

        // const validation = accessorySchema.safeParse(values);
        // if (!validation.success) {
        //     return {error: 'Invalid assignment data'};
        // }
        //
        // const session = await auth()

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
                    companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04',
                    reorderPoint: values.reorderPoint,
                    totalQuantityCount: values.totalQuantityCount,
                    material: values.material || '',
                    weight: values.weight,
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

export const get = async () => {
    try {
        const assets = await prisma.accessory.findMany({
            include: {
                company: true,
                supplier: true,
                inventory: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}

export const findById = async (id: string) => {
    try {
        const asset = await prisma.accessory.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(asset);
    } catch (error) {
        console.log(error)
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

// export async function processAccessoryCSV(csvContent: string) {
//     try {
//         const data = processRecordContents(csvContent)
//         const session = await auth()
//
//         await prisma.$transaction(async (tx) => {
//             const records = [];
//
//             for (const item of data) {
//
//                 const model = await tx.model.findFirst({
//                     where: {
//                         name: item['model']
//                     }
//                 })
//                 const statusLabel = await tx.statusLabel.findFirst({
//                     where: {
//                         name: item['statusLabel']
//                     }
//                 })
//                 const supplier = await tx.supplier.findFirst({
//                     where: {
//                         name: item['supplier']
//                     }
//                 })
//
//                 const location = await tx.departmentLocation.findFirst({
//                     where: {
//                         name: item['location']
//                     }
//                 })
//
//                 const department = await tx.department.findFirst({
//                     where: {
//                         name: item['department']
//                     }
//                 })
//
//                 const inventory = await tx.inventory.findFirst({
//                     where: {
//                         name: item['inventory']
//                     }
//                 })
//
//                 // if (!model || !statusLabel || !supplier) {
//                 //     continue;
//                 // }
//
//                 const record = await tx.accessory.create({
//                     data: {
//                         name: item['name'],
//                         purchaseDate: item['purchaseDate'],
//                         endOfLife: item['endOfLife'],
//                         alertEmail: item['alertEmail'],
//                         modelId: model?.id,
//                         statusLabelId: statusLabel?.id,
//                         departmentId: department?.id,
//                         locationId: location?.id,
//                         price: parseFloat(item['price']),
//                         companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04',  // session.user?.companyId
//                         reorderPoint: Number(item['reorderPoint']),
//                         totalQuantityCount: Number(item['totalQuantityCount']),
//                         material: item['material'],
//                         weight: item['weight'],
//                         supplierId: supplier?.id,
//                         inventoryId: inventory?.id,
//                         poNumber: item['poNumber'],
//                         notes: item['notes'],
//                         company: {
//                             connect: {
//                                 id: 'bf40528b-ae07-4531-a801-ede53fb31f04'
//                             }
//                         }
//                     },
//                 });
//                 records.push(record);
//             }
//
//             return records;
//         });
//
//
//         revalidatePath('/assets')
//
//         return {
//             success: true,
//             message: `Successfully processed ${data.length} records`,
//             data: data
//         }
//     } catch (error) {
//         console.error('Error processing CSV:', error)
//         return {
//             success: false,
//             message: error instanceof Error ? error.message : 'Failed to process CSV file'
//         }
//     }
// }



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
                    tx.model.findFirst({ where: { name: item['model'] } }),
                    tx.statusLabel.findFirst({ where: { name: item['statusLabel'] } }),
                    tx.supplier.findFirst({ where: { name: item['supplier'] } }),
                    tx.departmentLocation.findFirst({ where: { name: item['location'] } }),
                    tx.department.findFirst({ where: { name: item['department'] } }),
                    tx.inventory.findFirst({ where: { name: item['inventory'] } }),
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
