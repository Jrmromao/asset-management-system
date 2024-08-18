"use server";

import {registerUser} from "./user.actions";
import {PrismaClient} from "@prisma/client";


const prisma = new PrismaClient()

export const registerCompany = async (data: CompanyRegistrationProps) => {

    try {

        const company = await prisma.company.create({
            data: {
                name: data.companyName,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        })
        const user = await registerUser({
           firstName: data.firstName,
           lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            companyId: company.id,
            password: data.password,
            roleId: '2',
        })


    } catch (error) {
        console.error("An error occurred while getting the accounts:", error);
    }
};