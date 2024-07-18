'use server';
import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {redirect} from "next/navigation";

export const createCategory = async (categoryData: {  name: string }) => {
    try {
        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        return parseStringify(category );
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
