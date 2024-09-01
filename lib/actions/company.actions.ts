"use server";

import {registerUser} from "./user.actions";
import {PrismaClient} from "@prisma/client";
import {forgotPasswordConfirmSchema, registerSchema} from "@/lib/schemas";
import {z} from "zod";


const prisma = new PrismaClient()

export const registerCompany = async (values: z.infer<typeof registerSchema>) => {

    try {

        const validation = registerSchema.safeParse(values)
        if (!validation.success) return {error: validation.error.issues[0].message}

        const {companyName, lastName, firstName, email, password, phoneNumber} = validation.data

        const company = await prisma.company.create({
            data: {
                name: companyName,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        })
        await registerUser({
            email,
            password,
            firstName,
            lastName,
            phoneNumber,
            companyId: company.id
        })


    } catch (error) {
        console.error("An error occurred while getting the accounts:", error);
    }
};


export const validateCompany = async (companyName: string) => {
    try {
        return await prisma.company.findUnique({
            where: {
                name:   companyName,
            },
        });
    } catch (error) {
        console.error('An error occurred while getting the accounts:', error);
    }
};