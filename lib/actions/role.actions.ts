'use server';

import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";

const prisma = new PrismaClient()
//
// export const create = async (data: Asset) => {
//     try {
//         const { license } = data;
//
//         const licenseData = license?.id
//             ? { connect: { id: license.id } } // use existing license
//             : {
//                 create: {
//                     name: license?.name!,
//                     key: license?.key!,
//                     issuedDate: license?.issuedDate!,
//                     expirationDate: license?.expirationDate!,
//                     licenseUrl: license?.licenseUrl
//                 }
//             };
//
//         await prisma.asset.create({
//             data: {
//                 name: data.name,
//                 price: data.purchasePrice,
//                 brand: data.brand,
//                 model: data.model,
//                 serialNumber: data.serialNumber,
//                 category: {
//                     connect: {
//                         id: Number(data.categoryId)
//                     }
//                 },
//                 license: licenseData
//             },
//         });
//
//     } catch (error) {
//         console.error('Error creating asset:', error);
//     }
// }

export const get = async () => {
    try {
        const roles = await prisma.role.findMany({});
        return parseStringify(roles);
    } catch (error) {
        console.log(error)
    }
}

// export const findById = async (id: number) => {
//     try {
//         const asset = await prisma.asset.findFirst({
//             where: {
//                 id: id
//             }
//         });
//         return parseStringify(asset);
//     } catch (error) {
//         console.log(error)
//     }
// }
//
// export const remove = async (id: number) => {
//     try {
//         const asset = await prisma.asset.delete({
//             where: {
//                 id: id
//             }
//         })
//         return parseStringify(asset);
//     } catch (error) {
//         console.log(error)
//     }
// }
//
// export const update = async (asset: Asset, id: number) => {
//     try {
//         // const assets = await prisma.asset.update({
//         //     where: {
//         //         id: id
//         //     },
//         //     data: asset
//         // });
//         // return parseStringify(assets);
//
//         console.log(asset)
//     } catch (error) {
//         console.log(error)
//     }
// }
//
//
//
//
//

