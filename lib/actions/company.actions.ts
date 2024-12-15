"use server";

import {registerUser} from "./user.actions";
import {Prisma, PrismaClient} from "@prisma/client";
import {forgotPasswordConfirmSchema, registerSchema} from "@/lib/schemas";
import {z} from "zod";


const prisma = new PrismaClient()

export const registerCompany = async (values: z.infer<typeof registerSchema>) => {
    try {
        const validation = await registerSchema.safeParseAsync(values);
        if (!validation.success) {
            return { error: validation.error.issues[0].message };
        }

        const { companyName, lastName, firstName, email, password, phoneNumber } = validation.data;

        console.log(validation.data);


        // Create company
        const company = await prisma.company.create({
            data: {
                name: companyName!
            },
        });

        // Get admin role
        const role = await prisma.role.findUnique({
            where: { name: 'Admin' }
        });

        if (!role) {
            return { error: 'Admin role not found' };
        }

        const user = await registerUser({
            email,
            password,
            firstName,
            lastName,
            roleId: role.id,
            title: 'Admin',
            employeeId: 'ECO0001',
            phoneNumber,
            companyId: company.id
        });

        return { success: true, data: { company, user } };

    } catch (error) {
        console.error("Error in registerCompany:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: 'A company with this name already exists' };
            }
        }

        return { error: 'Failed to register company' };
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