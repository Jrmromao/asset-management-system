'use server';

import {prisma} from "@/app/db";
import {parseStringify, processRecordContents, roundFloat} from "@/lib/utils";
import {auth} from "@/auth";
import {z} from "zod";
import {assetAssignSchema} from "@/lib/schemas";
import {Prisma} from "@prisma/client";
import {parse} from 'csv-parse/sync'
import {revalidatePath} from "next/cache";

// Common include object for consistent asset queries
const assetIncludes = {
    // license: true,
    model: true,
    company: true,
    statusLabel: true,
} as const;

// Type for the API response
type ApiResponse<T> = {
    data?: T;
    error?: string;
};

export async function create(data: Asset): Promise<ApiResponse<Asset>> {
    try {
        const session = await auth();
        if (!session?.user?.companyId) {
            return {error: 'Unauthorized access'};
        }

        const newAsset = await prisma.asset.create({
            data: {
                name: data.name,
                serialNumber: data.serialNumber,
                material: data.material || '',
                modelId: data.modelId,
                endOfLife: data.endOfLife,
                // licenseId: data.licenseId,
                statusLabelId: data.statusLabelId,
                supplierId: data.supplierId,
                companyId: session.user.companyId,
                locationId: data.locationId,
                departmentId: data.departmentId,
                weight: data.weigh,
                price: data.price,
                poNumber: data.poNumber,
                datePurchased: data.datePurchased,
                inventoryId: data.inventoryId
            },
            include: assetIncludes,
        });
        return {data: parseStringify(newAsset)};
    } catch (error) {
        console.error('Error creating asset:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return {error: 'Serial number already exists'};
            }
        }
        return {error: 'Failed to create asset'};
    }
}

export async function get(): Promise<ApiResponse<Asset[]>> {
    try {
        // const session = await auth();
        // if (!session?.user?.companyId) {
        //     return {error: 'Unauthorized access'};
        // }

        const assets = await prisma.asset.findMany({
            include: assetIncludes,
            orderBy: {createdAt: 'desc'},
            where: {companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04'}
        });


        return {data: parseStringify(assets)};
    } catch (error) {
        console.error('Error fetching assets:', error);
        return {error: 'Failed to fetch assets'};
    }
}

export async function findById(id: string): Promise<ApiResponse<Asset>> {
    try {
        if (!id) {
            return {error: 'Asset ID is required'};
        }

        const asset = await prisma.asset.findFirst({
            include: assetIncludes,
            where: {id}
        });

        if (!asset) {
            return {error: 'Asset not found'};
        }

        return {data: parseStringify(asset)};
    } catch (error) {
        console.error('Error finding asset:', error);
        return {error: 'Failed to find asset'};
    }
}

export async function remove(id: string): Promise<ApiResponse<Asset>> {
    try {
        if (!id) {
            return {error: 'Asset ID is required'};
        }

        const asset = await prisma.asset.delete({
            where: {id}
        });

        return {data: parseStringify(asset)};
    } catch (error) {
        console.error('Error deleting asset:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return {error: 'Asset not found'};
            }
        }
        return {error: 'Failed to delete asset'};
    }
}

export async function update(asset: Asset, id: string): Promise<ApiResponse<Asset>> {
    try {
        if (!id || !asset) {
            return {error: 'Asset ID and data are required'};
        }

        const updatedAsset = await prisma.asset.update({
            where: {id},
            data: {
                name: asset.name,
                serialNumber: asset.serialNumber,
                company: {
                    connect: {id: asset.companyId}
                },
                statusLabel: {
                    connect: {id: asset.statusLabelId}
                },
            }
        });

        return {data: parseStringify(updatedAsset)};
    } catch (error) {
        console.error('Error updating asset:', error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return {error: 'Asset not found'};
            }
        }
        return {error: 'Failed to update asset'};
    }
}

export async function assign(values: z.infer<typeof assetAssignSchema>): Promise<ApiResponse<Asset>> {
    try {
        const validation = assetAssignSchema.safeParse(values);
        if (!validation.success) {
            return {error: 'Invalid assignment data'};
        }

        const {assetId, userId} = values;
        const updatedAsset = await prisma.asset.update({
            where: {id: assetId},
            data: {assigneeId: userId},
            include: assetIncludes
        });

        return {data: parseStringify(updatedAsset)};
    } catch (error) {
        console.error('Error assigning asset:', error);
        return {error: 'Failed to assign asset'};
    }
}

export async function unassign(assetId: string): Promise<ApiResponse<Asset>> {
    try {
        if (!assetId) {
            return {error: 'Asset ID is required'};
        }

        const updatedAsset = await prisma.asset.update({
            where: {id: assetId},
            data: {assigneeId: null},
            include: assetIncludes
        });

        return {data: parseStringify(updatedAsset)};
    } catch (error) {
        console.error('Error unassigning asset:', error);
        return {error: 'Failed to unassign asset'};
    }
}


export async function processAssetsCSV(csvContent: string) {
    try {
        const data = processRecordContents(csvContent)
        const session = await auth()
        // Save to database using transaction
        await prisma.$transaction(async (tx) => {
            const records = [];

            for (const item of data) {
                const model = await tx.model.findFirst({
                    where: {
                        name: item['model']
                    }
                })
                const statusLabel = await tx.statusLabel.findFirst({
                    where: {
                        name: item['statusLabel']
                    }
                })
                const supplier = await tx.supplier.findFirst({
                    where: {
                        name: item['supplier']
                    }
                })

                if (!model || !statusLabel || !supplier) {
                    continue;
                }
                if (!session){
                    throw new Error('User not authenticated.');
                }

                const record = await tx.asset.create({
                    data: {
                        name: item['name'],
                        weight: roundFloat(Number(item['weight']), 2),
                        serialNumber: item['serialNum'],
                        material: item['material'],
                        modelId: model?.id,
                        endOfLife: new Date(item['endOfLife']),
                        statusLabelId: statusLabel?.id,
                        supplierId: supplier?.id,
                        poNumber: item['poNumber'],
                        price: roundFloat(Number(item['price']), 2),
                        companyId: session?.user?.companyId,
                    }
                });
                records.push(record);
            }

            return records;
        });


        revalidatePath('/assets')

        return {
            success: true,
            message: `Successfully processed ${data.length} records`,
            data: data
        }
    } catch (error) {
        console.error('Error processing CSV:', error)
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to process CSV file'
        }
    }
}


