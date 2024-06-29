'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";

export const create = async (data: {
    datePurchased: string;
    name: string;
    description: string | undefined;
    location: string;
    purchasePrice: number;
    categoryId: number;
    status: string
}) => {
    try {
        await prisma.asset.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.purchasePrice,
                categoryId: 8,
                userId: 10,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })
    } catch (error) {
        console.log(error)
    }
}
export const get = async () => {
    try {
        const assets = await prisma.asset.findMany();
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




