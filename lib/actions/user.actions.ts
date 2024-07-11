// 'use server';
//
// // import {prisma} from "@/app/db";
// import { PrismaClient } from '@prisma/client'
//
// const prisma = new PrismaClient()
//
// import {parseStringify} from "@/lib/utils";
//
// export const create = async (data: {
//     key: string;
//     expirationDate: Date;
//     issuedDate: Date;
//     name: string;
// }) => {
//     try {
//         await prisma.licenseTool.create({
//             data: {
//                 key: data.key,
//                 expirationDate: data.expirationDate,
//                 issuedDate: data.issuedDate,
//                 name: data.name,
//                 createdAt: new Date(),
//                 updatedAt: new Date()
//             }
//         })
//     } catch (error) {
//         console.log(error)
//     }
//     finally {
//         await prisma.$disconnect()
//     }
// }
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
// // adding a new  comment
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
