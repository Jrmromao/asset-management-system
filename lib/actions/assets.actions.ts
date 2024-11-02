'use server';

import {prisma} from "@/app/db";
import {parseStringify} from "@/lib/utils";
import {auth} from "@/auth";
import {z} from "zod";
import {assetAssignSchema, loginSchema} from "@/lib/schemas";
import {Asset} from "@/types";

export const create = async (data: Asset) => {
    try {
        const newAsset = await prisma.asset.create({
            data: {
                name: data.name,
                serialNumber: data.serialNumber,
                companyId: data.companyId,
                material: data.material,
                modelId: data.modelId,
                endOfLife: data.endOfLife,
                licenseId: data.licenseId,
                statusLabelId: data.statusLabelId,
                supplierId: data.supplierId,
            },
            include: {
                Company: true,
                Supplier: true,
                StatusLabel: true,
                License: true,
                Co2eRecord: true,
            },
        });

        console.log('Asset created successfully:', newAsset);
    } catch (error) {
        console.error('Error creating asset:', error);
    } finally {
        await prisma.$disconnect();
    }
}

export const get = async () => {
    try {
        const session = await auth()
        const assets = await prisma.asset.findMany({
            include: {
                License: true,
                Model: true,
                Company: true,
                Co2eRecord: true,
                StatusLabel: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            where: {
                companyId: session?.user?.companyId
            }
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}

export const findById = async (id: string) => {
    try {
        const asset = await prisma.asset.findFirst({
            include: {
                License: true,
                Model: true,
                Company: true,
                Co2eRecord: true,
                StatusLabel: true
            },
            where: {
                id: id
            },
        });

        return parseStringify(asset);
    } catch (error) {
        console.log(error)
    }
}

export const remove = async (id: string) => {
    try {
        const asset = await prisma.asset.delete({
            where: {
                id: id
            }
        })
        return parseStringify(asset);
    } catch (error) {
        console.log(error)
    }
}

export const update = async (asset: Asset, id: string) => {
    try {
        const assets = await prisma.asset.update({
            where: {
                id: id
            },
            data: {
                name: asset.name,
                serialNumber: asset.serialNumber,
                Company: {
                    connect: {
                        id: asset.companyId
                    },
                },
                StatusLabel: {
                    connect: {
                        id: asset.statusLabelId
                    },
                },
            }
        });
        return parseStringify(assets);
    } catch (error) {
        console.log(error)
    }
}

export const assign = async (values: z.infer<typeof assetAssignSchema>) => {
    try {
        const validation = assetAssignSchema.safeParse(values)
        if (!validation.success) return {error: 'Invalid email or password'}
        const {assetId, userId} = values

        const updatedAsset = await prisma.asset.update({
            where: {id: assetId},
            data: {
                assigneeId: userId,
            },
        });
        return parseStringify(updatedAsset);
    } catch (error) {
        console.log(error)
    }
}

export const unassign = async (assetId: string) => {
    try {
        const updatedAsset = await prisma.asset.update({
            where: {id: assetId},
            data: {
                assigneeId: null,
            },
        });
        return parseStringify(updatedAsset);
    } catch (error) {
        console.log(error)
    }
}
