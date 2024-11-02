'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {auth} from "@/auth";


export const create = async (data: Accessory) => {
    try {
        const session = await auth()
        await prisma.accessory.create({
                data: {
                    title: data.title,
                    purchaseDate: data.purchaseDate,
                    vendor: data.vendor,
                    alertEmail: data.alertEmail,
                    minQuantityAlert: data.minQuantityAlert,
                    totalQuantityCount: data.totalQuantityCount,
                    material: data.material,
                    endOfLife: data.endOfLife,
                    company: {
                        connect: {
                            id:  session?.user.companyId
                        },
                    },
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




