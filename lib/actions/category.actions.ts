'use server';
import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";


export const createCategory = async (categoryData: { name: string }) => {
    try {

        const category = await prisma.category.create({
            data: {
                name: 'IT Support',
                company: {
                    connect: {
                        id: '0c82b08e-2391-4819-8ba7-1af8e5721c74'
                    },
                },
            },
        }).then(result => console.log(result))
            .catch(error => console.log(error))

        return parseStringify(category);
    } catch (error) {
        console.log(error)
    }
}

export const getCategories = async () => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return parseStringify(categories);
    } catch (error) {
        console.log(error)
    }
}

export const remove = async (id: string) => {
    try {
        const licenseTool = await prisma.category.delete({
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