'use server';

// import {prisma} from "@/app/db";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

import {parseStringify} from "@/lib/utils";

export const create = async (data: {
    key: string;
    expirationDate: Date;
    issuedDate: Date;
    name: string;
}) => {
    console.log(data)
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


        // id             Int          @id @default(autoincrement())
        // action         String
        // entity         String
        // entityId       Int?
        // userId         Int
        // user           User         @relation(fields: [userId], references: [id])
        // organizationId Int
        // organization   Organization @relation(fields: [organizationId], references: [id])
        // details        String?
        //     createdAt      DateTime     @default(now())
    } catch (error) {
        console.log(error)
    }
    finally {
        await prisma.$disconnect()
    }
}
export const getLicenses = async () => {
    try {


        const licenseTools = await prisma.license.findMany();


        return parseStringify(licenseTools);
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
export const remove = async (id: number) => {
    try {
        const licenseTool = await prisma.license.delete({
            where: {
                id: id
            }
        })
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    }
    finally {
        await prisma.$disconnect()
    }
}
// adding a new  comment
export const update = async (data: {
    id: number;
    key: string;
    expirationDate: Date;
    issuedDate: Date;
    name: string;
}, id: number) => {
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




