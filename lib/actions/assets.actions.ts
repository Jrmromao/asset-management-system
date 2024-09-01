'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {auth} from "@/auth";


export const create = async (data: Asset) => {
    try {
        const session = await auth()

        await prisma.asset.create({
            data: {
                name: data.name,
                price: data.price,
                brand: data.brand,
                model: data.model,
                serialNumber: data.serialNumber,
                category: {
                    connect: {
                        id: data.categoryId
                    },
                },
                company: {
                    connect: {
                        id: session?.user?.companyId
                    },
                },
                statusLabel: {
                    connect: {
                        id: data.statusLabelId
                    },
                },
            },
        });
    } catch (error) {
        console.error('Error creating asset:', error);
        throw error;
    }
}

export const get = async () => {
    try {
        const session = await auth()
        const assets = await prisma.asset.findMany({
            include: {
                category: true,
                license: true,
                statusLabel: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                companyId: session?.user?.companyId
            }
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}

export const findById = async (id: string) => {
    try {
        const asset = await prisma.asset.findFirst({
            include: {
                category: true,
                license: true,
                statusLabel: true
            },
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
        const asset = await prisma.asset.delete({
            where: {
                id: id
            }
        })
        return parseStringify(asset);
    } catch (error) {
        console.log(error)
    }
}

export const update = async (asset: Asset, id: string) => {
    try {
        const assets = await prisma.asset.update({
            where: {
                id: id
            },
            data: {
                name: asset.name,
                price: asset.price,
                brand: asset.brand,
                model: asset.model,
                serialNumber: asset.serialNumber,
                categoryId: asset.categoryId,
                statusLabelId: asset.statusLabelId
            }
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}




