'use server';
import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {auth} from "@/auth";


export const insert = async (categoryData: { name: string }) => {
    try {
        console.log(categoryData)
        const session = await auth()
        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
                createdAt: new Date(),
                updatedAt: new Date(),
                company: {
                    connect: {
                        id: session?.user?.companyId
                    },
                },
            },
        }).then(result => console.log(result))
            .catch(error => console.log(error))
        console.log(category)
        // return parseStringify(category);
    } catch (error) {
        console.log(error)
    }
}

export const getCategories = async () => {
    try {
        const session = await auth()
        const categories = await prisma.category.findMany({
            orderBy: {
                name: 'desc'
            },
            where: {
                companyId: session?.user?.companyId
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