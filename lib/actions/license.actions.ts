'use server';
import {parseStringify} from "@/lib/utils";
import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient()

export const insert = async (data: License) => {
    try {

        data.purchasePrice = Math.round(data.purchasePrice * 100) / 100


        await prisma.license.create({data})
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const getAll = async () => {
    try {


        const licenses = await prisma.license.findMany();


        return parseStringify(licenses);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: string) => {
    try {
        const licenseTool = await prisma.license.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const update = async (data: License, id: string) => {
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
    } finally {
        await prisma.$disconnect()
    }
}
export const remove = async (id: string) => {

    console.log(id)

    const licenseTool = await prisma.license.delete({
        where: {
            id: id
        }
    })
    return parseStringify(licenseTool);

}




