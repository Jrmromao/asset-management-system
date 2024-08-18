'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";


export const create = async (data: Accessory) => {
    try {
        await prisma.accessory.create({
                data: {
                    title: data.title,
                    description: data.description,
                    purchaseDate: data.purchaseDate,
                    vendor: data.vendor,
                    alertEmail: data.alertEmail,
                    minQuantityAlert: data.minQuantityAlert,
                    totalQuantityCount: data.totalQuantityCount,
                    company: {
                        connect: {
                            id: '0c82b08e-2391-4819-8ba7-1af8e5721c74'//data.companyId
                        }
                    },
                    category: {
                        connect: {
                            id: 'a3c25ff4-7af1-4c7b-92d8-de57351b6f8e'//data.categoryId
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
                category: true,
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




