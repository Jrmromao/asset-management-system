'use server';

import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";
import {auth} from "@/auth";

const prisma = new PrismaClient()
export const get = async () => {
    try {
        const roles = await prisma.role.findMany({
            orderBy: {
                name: 'asc'
            },
        });

        console.log(roles)
        return parseStringify(roles);
    } catch (error) {
        console.log(error)
    }
}
// export const insert = async (data: Role) => {
//     try {
//         const session = await auth()
//         await prisma.role.create({
//             data: {
//                 name: data.name,
//                 Company: {
//                     connect: {
//                         id: session?.user?.companyId
//                     },
//                 },
//             },
//         })
//     } catch (error) {
//         console.error(error)
//     } finally {
//         await prisma.$disconnect()
//     }
// }
// export const findById = async (id: string) => {
//     try {
//         const labels = await prisma.role.findFirst({
//             where: {
//                 id: id
//             }
//         });
//         return parseStringify(labels);
//     } catch (error) {
//         console.log(error)
//     } finally {
//         await prisma.$disconnect()
//     }
// }
// export const remove = async (id: string) => {
//     try {
//         const labels = await prisma.role.delete({
//             where: {
//                 id: id
//             }
//         })
//         return parseStringify(labels);
//     } catch (error) {
//         console.log(error)
//     }
// }