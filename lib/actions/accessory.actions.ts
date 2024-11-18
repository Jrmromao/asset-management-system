'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {auth} from "@/auth";
import {z} from "zod";
import {accessorySchema, assetAssignSchema} from "@/lib/schemas";


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
                    title: values.name,
                    purchaseDate: values.purchaseDate,
                    endOfLife: values.endOfLife || '',
                    alertEmail: values.alertEmail,
                    //modelId
                    // statusLabel
                    // department
                    // location
                    price: values.price,
                    companyId: 'bf40528b-ae07-4531-a801-ede53fb31f04',
                    minQuantityAlert: values.reorderPoint, // rename to reorderPoint
                    totalQuantityCount: values.totalQuantityCount,

                    material: values.material || '',
                    // weight
                    // supplier
                    // inventory
                    // notes
                    poNumber: values.poNumber,
                    vendor: values.supplierId, // to be rmeoved
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
                company: true
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
        const assets = await prisma.asset.update({
            where: {
                id: id
            },
            data: asset
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}




