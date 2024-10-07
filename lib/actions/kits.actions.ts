'use server';

import {PrismaClient} from '@prisma/client'
import {parseStringify} from "@/lib/utils";
import {signUp as CognitoSignUp} from "@/services/aws/Cognito";
import {auth} from "@/auth";

const prisma = new PrismaClient()
export const get = async () => {
    try {
        const session = await auth()
        const kits = await prisma.kit.findMany({
            orderBy: {
                name: 'asc'
            },
            where:{
                companyId: session?.user.companyId
            }
        });


        return parseStringify(kits);
    } catch (error) {
        console.log(error)
    }
}


export const insert = async (data: Kit) => {
    try {
        const session = await auth()
        await prisma.kit.create({
            data: {
                name: data.name,
                description: data.description,
                company: {
                    connect: {
                        id: session?.user?.companyId
                    },
                },
                assets:{
                    create: data.assets
                },
                accessories:{
                    create:data.accessories
                },
                licenses:{
                    create:data.licenses
                }
            },
        })
    } catch (error) {
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const findById = async (id: string) => {
    try {
        const session = await auth()
        const kit = await prisma.kit.findFirst({
            where: {
                id: id,
                companyId: session?.user.companyId
            },
            include: {
                assets: {
                    include: {
                        asset: true,
                    },
                },
                accessories: {
                    include: {
                        accessory: true,
                    },
                },
                licenses: {
                    include: {
                        license: true,
                    },
                },
            }
        });
        return parseStringify(kit);
    } catch (error) {
        console.log(error)
    } finally {
        await prisma.$disconnect()
    }
}
export const remove = async (id: string) => {
    try {
        const kits = await prisma.role.deleteMany({
            where: {
                id: id
            }
        })

        // await prisma.kitItem.deleteMany({
        //     where: {
        //         kitId: kitId,
        //         assetId: 'specific-asset-id', // Optional: Remove only specific asset
        //         accessoryId: 'specific-accessory-id', // Optional: Remove only specific accessory
        //         licenseId: 'specific-license-id', // Optional: Remove only specific license
        //     },
        // });

        return parseStringify(kits);
    } catch (error) {
        console.log(error)
    }
}