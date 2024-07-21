'use server';

import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";


const prisma = new PrismaClient()

export const registerUser = async (data: { email: string; password: string, roleId: number, companyId: number, firstName?: string, lastName?: string, phoneNumber?: string }) => {
    try {

        console.log('data: ',data)

        const cognitoRegisterResult = await CognitoSignUp({
            clientId: process.env.COGNITO_CLIENT_ID!,
            username: data.email.split('@')[0],
            email: data.email,
            password: data.password,
            companyId: data.companyId
        }).catch((error)=>{
            return error
        });

        console.log('cognitoRegisterResult: ',cognitoRegisterResult)

        if ('cognitoRegisterResult') {
            let newUser = await prisma.user.create({
                data: {
                    roleId: 4,
                    companyId: data.companyId,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });

        }
        console.log(cognitoRegisterResult)

        return parseStringify(cognitoRegisterResult);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
//
// export const getLicenses = async () => {
//     try {
//
//
//         const licenses = await prisma.licenseTool.findMany();
//
//
//         return parseStringify(licenses);
//     } catch (error) {
//         console.log(error)
//     }
//     finally {
//         await prisma.$disconnect()
//     }
// }
//
// export const findById = async (id: number) => {
//     try {
//         const licenseTool = await prisma.licenseTool.findFirst({
//             where: {
//                 id: id
//             }
//         });
//         return parseStringify(licenseTool);
//     } catch (error) {
//         console.log(error)
//     }
//     finally {
//         await prisma.$disconnect()
//     }
// }
//
// export const remove = async (id: number) => {
//     try {
//         const licenseTool = await prisma.licenseTool.delete({
//             where: {
//                 id: id
//             }
//         })
//         return parseStringify(licenseTool);
//     } catch (error) {
//         console.log(error)
//     }
//     finally {
//         await prisma.$disconnect()
//     }
// }
//
//
//
// export const update = async (data: {
//     id: number;
//     key: string;
//     expirationDate: Date;
//     issuedDate: Date;
//     name: string;
// }, id: number) => {
//     try {
//         const licenseTool = await prisma.licenseTool.update({
//             where: {
//                 id: id
//             },
//             data
//         });
//         return parseStringify(licenseTool);
//     } catch (error) {
//         console.log(error)
//     }
//     finally {
//         await prisma.$disconnect()
//     }
// }
//
//
//
//
