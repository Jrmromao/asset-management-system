'use server';

import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";

const prisma = new PrismaClient()

export const registerUser = async (data: RegUser) => {
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


export const insert = async (userData: User) => {
    try {
        await prisma.user.create({
            data: {
                roleId: 0,
                companyId: 0,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phoneNumber: userData.phoneNumber,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const getAll = async () => {
    try {


        const licenses = await prisma.user.findMany();


        return parseStringify(licenses);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: number) => {
    try {
        const licenseTool = await prisma.user.findFirst({
            where: {
                id: id
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const update = async (data: User, id: number) => {
    try {
        const licenseTool = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                roleId: data.roleId,
                companyId: data.companyId,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
            }
        });
        return parseStringify(licenseTool);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}




