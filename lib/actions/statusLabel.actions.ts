'use server';
import {parseStringify} from "@/lib/utils";
import {prisma} from "@/app/db";

export const insert = async (data: StatusLabel) => {
    try {
        await prisma.statusLable.create({
            data: {
                name: data.name,
                colorCode: data.colorCode,
                isArchivable: data.isArchivable,
                allowLoan: data.allowLoan
            }
        })
    } catch (error) {
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const getAll = async () => {
    try {
        const labels = await prisma.statusLable.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(labels)

        return parseStringify(labels);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: number) => {
    try {
        const labels = await prisma.statusLable.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(labels);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const remove = async (id: number) => {
    try {
        const labels = await prisma.statusLable.delete({
            where: {
                id: id
            }
        })
        return parseStringify(labels);
    } catch (error) {
        console.log(error)
    }
}




