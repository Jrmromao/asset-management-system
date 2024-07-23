'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";

export const create = async (data: {
    serialNumber: string;
    datePurchased: string;
    name: string;
    model: string;
    purchasePrice: number;
    brand: string;
    categoryId: string | number
}) => {

    console.log(data)

    try {
        let prismaAssetClient = await prisma.asset.create({
            data: {
                name: data.name,
                brand: data.brand,
                model: data.model,
                price: data.purchasePrice,
                serialNumber: data.serialNumber,
                licenceUrl: '',
                certificateUrl: '',
                categoryId: Number(data.categoryId),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });


    } catch (error) {
        console.log(error)
    }
}
export const get = async () => {
    try {
        const assets = await prisma.asset.findMany({
            include: {
                category: true,

            }
        });

        console.log(assets)
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

export const update = async (data: {
    id: number;
    datePurchased: string;
    name: string;
    description: string | undefined;
    location: string;
    purchasePrice: number;
    categoryId: number;
    status: string
}, id: number) => {
    try {
        const assets = await prisma.asset.update({
            where: {
                id: id
            },
            data
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}




