'use server';
import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";


export const createCategory = async (categoryData: { name: string }) => {
    try {

        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
            }
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

export const remove = async (id: number) => {
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