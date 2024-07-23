'use server';

import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";

const prisma = new PrismaClient()

export const registerUser = async (data: {
    email: string;
    password: string,
    roleId: number,
    companyId: number,
    firstName?: string,
    lastName?: string,
    phoneNumber?: string
}) => {
    try {
        const cognitoRegisterResult = await CognitoSignUp({
            clientId: process.env.COGNITO_CLIENT_ID!,
            username: data.email.split('@')[0],
            email: data.email,
            password: data.password,
            companyId: data.companyId
        }).then(async (result) => {
            await prisma.user.create({
                data: {
                    id: cognitoRegisterResult.UserSub,
                    roleId: 4,
                    companyId: data.companyId,
                    email: data.email,
                    firstName: data.firstName!,
                    lastName: data.lastName!,
                    phoneNumber: data.phoneNumber!,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
        }).catch((error) => {
            return error
        });
        return parseStringify(cognitoRegisterResult);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
