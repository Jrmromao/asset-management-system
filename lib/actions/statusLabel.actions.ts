'use server';
import {parseStringify} from "@/lib/utils";
import {prisma} from "@/app/db";
import {auth} from "@/auth";

export const insert = async (data: StatusLabel) => {
    try {
        const session = await auth()
        await prisma.statusLabel.create({
            data: {
                name: data.name,
                colorCode: data.colorCode || '#000000',
                isArchived: data.isArchived,
                allowLoan: data.allowLoan,
                description: data.description,
                companyId: session?.user?.companyId!,
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
        const session = await auth()
        const labels = await prisma.statusLabel.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                companyId: session?.user?.companyId
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
        const labels = await prisma.statusLabel.findFirst({
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
        const labels = await prisma.statusLabel.delete({
            where: {
                id: id
            }
        })
        return parseStringify(labels);
    } catch (error) {
        console.log(error)
    }
}




