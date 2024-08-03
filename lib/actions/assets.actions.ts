'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";



export const create = async (data: Asset) => {
    try {
        const { license } = data;

        await prisma.asset.create({
            data: {
                name: data.name,
                price: data.purchasePrice,
                brand: data.brand,
                model: data.model,
                serialNumber: data.serialNumber,
                category: {
                    connect: {
                        id: Number(data.categoryId)
                    }
                },
            },
        });

    } catch (error) {
        console.error('Error creating asset:', error);
    }
}

export const get = async () => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                category: true,
            }
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}

export const findById = async (id: number) => {
    try {
        const asset = await prisma.asset.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(asset);
    } catch (error) {
        console.log(error)
    }
}

export const remove = async (id: number) => {
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

export const update = async (asset: Asset, id: number) => {
    try {
        // const assets = await prisma.asset.update({
        //     where: {
        //         id: id
        //     },
        //     data: asset
        // });
        // return parseStringify(assets);

        console.log(asset)
    } catch (error) {
        console.log(error)
    }
}




