'use server';

// import {prisma} from "@/app/db";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

import {parseStringify} from "@/lib/utils";

export const insert = async (data: {
    key: string;
    expirationDate: Date;
    issuedDate: Date;
    name: string;
}) => {
    try {
        await prisma.license.create({
            data: {
                key: data.key,
                expirationDate: data.expirationDate,
                issuedDate: data.issuedDate,
                name: data.name,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })
    } catch (error) {
        console.log(error)
    }
    finally {
        await prisma.$disconnect()
    }
}
export const getAll = async () => {
    try {


        const licenses = await prisma.license.findMany();


        return parseStringify(licenses);
    } catch (error) {
        console.log(error)
    }
    finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: number) => {
    try {
        const licenseTool = await prisma.license.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    }
    finally {
        await prisma.$disconnect()
    }
}
export const update = async (data: License, id: number) => {
    try {
        const licenseTool = await prisma.license.update({
            where: {
                id: id
            },
            data
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    }
    finally {
        await prisma.$disconnect()
    }
}




