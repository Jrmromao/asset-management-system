'use server';
import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {redirect} from "next/navigation";

export const createCategory = async (categoryData: { note: string ; name: string }) => {
    try {
        const category = await prisma.category.create({
            data: {
                name: categoryData.name,
                note: categoryData.note,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        return parseStringify(category );
    } catch (error) {
        console.log(error)
    }
}

export const listCategories = async () => {
    try {
        const categories = await prisma.category.findMany();
        return parseStringify(categories);
    } catch (error) {
        console.log(error)
    }
}
