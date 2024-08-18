'use server';
import {parseStringify} from "@/lib/utils";
import {prisma} from "@/app/db";

export const insert = async (data: StatusLabel) => {
    try {
        await prisma.statusLable.create({
            data: {
                name: data.name,
                colorCode: data.colorCode,
                isArchived: data.isArchived,
                allowLoan: data.allowLoan,
                description: data.description,
                Company: {
                    connect: {
                        id: '0c82b08e-2391-4819-8ba7-1af8e5721c74'
                    },
                },
            },
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
        return parseStringify(labels);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: string) => {
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
export const remove = async (id: string) => {
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




