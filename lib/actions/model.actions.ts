'use server';

import {Prisma, PrismaClient} from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

// Fixed return type definition
type ActionReturn<T> = {
    data?: T;
    error?: string;
};

export async function insert(data: Model): Promise<ActionReturn<Model>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const model = await prisma.model.create({
            data: {
                name: data.name,
                modelNo: data.modelNo,
                categoryId: data.categoryId,
                manufacturerId: data.manufacturerId,
                companyId: session.user.companyId!
            }
        });

        revalidatePath('/models');
        return { data: parseStringify(model) };
    } catch (error) {
        console.error('Insert model error:', error);
        return { error: "Failed to create model" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function getAll(params?: {
    search?: string;
    categoryId?: string;
}): Promise<ActionReturn<Model[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }
        const where: Prisma.ModelWhereInput = {
            companyId: session.user.companyId,
            ...(params?.categoryId && { categoryId: params.categoryId }),
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } },
                    { modelNo: { contains: params.search, mode: 'insensitive' as Prisma.QueryMode } }
                ]
            })
        };

        const models = await prisma.model.findMany({
            where,
            include: {
                category: {
                    select: { name: true }
                },
                manufacturer: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { data: parseStringify(models) };
    } catch (error) {
        console.error('Get all models error:', error);
        return { error: "Failed to fetch models" };
    } finally {
        await prisma.$disconnect();
    }
}

// For a simpler version without insensitive search:
export async function getAllSimple(params?: {
    search?: string;
    categoryId?: string;
}): Promise<ActionReturn<Model[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const where: Prisma.ModelWhereInput = {
            companyId: session.user.companyId,
            ...(params?.categoryId && { categoryId: params.categoryId }),
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search } },
                    { modelNo: { contains: params.search } }
                ]
            })
        };

        const models = await prisma.model.findMany({
            where,
            include: {
                category: {
                    select: { name: true }
                },
                manufacturer: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { data: parseStringify(models) };
    } catch (error) {
        console.error('Get all models error:', error);
        return { error: "Failed to fetch models" };
    } finally {
        await prisma.$disconnect();
    }
}

// If your database doesn't support insensitive search,
// you can use a lowercase comparison:
export async function getAllWithLowerCase(params?: {
    search?: string;
    categoryId?: string;
}): Promise<ActionReturn<Model[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const searchLower = params?.search?.toLowerCase();

        const where: Prisma.ModelWhereInput = {
            companyId: session.user.companyId,
            ...(params?.categoryId && { categoryId: params.categoryId }),
            ...(searchLower && {
                OR: [
                    { name: { contains: searchLower } },
                    { modelNo: { contains: searchLower } }
                ]
            })
        };

        const models = await prisma.model.findMany({
            where,
            include: {
                category: {
                    select: { name: true }
                },
                manufacturer: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return { data: parseStringify(models) };
    } catch (error) {
        console.error('Get all models error:', error);
        return { error: "Failed to fetch models" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function findById(id: string): Promise<ActionReturn<Model>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const model = await prisma.model.findFirst({
            where: {
                id,
                companyId: session.user.companyId
            },
            include: {
                category: true,
                manufacturer: true,
                assets: {
                    select: {
                        id: true,
                        name: true,
                        serialNumber: true,
                        statusLabel: {
                            select: {
                                name: true,
                                colorCode: true
                            }
                        }
                    }
                }
            }
        });

        if (!model) {
            return { error: "Model not found" };
        }

        return { data: parseStringify(model) };
    } catch (error) {
        console.error('Find model by id error:', error);
        return { error: "Failed to fetch model" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function update(data: Model, id: string): Promise<ActionReturn<Model>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if model exists and belongs to company
        const existingModel = await prisma.model.findFirst({
            where: {
                id,
                companyId: session.user.companyId
            }
        });

        if (!existingModel) {
            return { error: "Model not found" };
        }

        const model = await prisma.model.update({
            where: { id },
            data: {
                name: data.name,
                modelNo: data.modelNo,
                categoryId: data.categoryId,
                manufacturerId: data.manufacturerId,
                companyId: session.user.companyId
            }
        });

        revalidatePath('/models');
        revalidatePath(`/models/${id}`);
        return { data: parseStringify(model) };
    } catch (error) {
        console.error('Update model error:', error);
        return { error: "Failed to update model" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function remove(id: string): Promise<ActionReturn<Model>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if model exists and belongs to company
        const existingModel = await prisma.model.findFirst({
            where: {
                id,
                companyId: session.user.companyId
            },
            include: {
                assets: {
                    select: { id: true },
                    take: 1
                }
            }
        });

        if (!existingModel) {
            return { error: "Model not found" };
        }

        if (existingModel.assets.length > 0) {
            return { error: "Cannot delete model with associated assets" };
        }

        const model = await prisma.model.delete({
            where: { id }
        });

        revalidatePath('/models');
        return { data: parseStringify(model) };
    } catch (error) {
        console.error('Delete model error:', error);
        return { error: "Failed to delete model" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function isModelNumberUnique(
    modelNo: string,
    excludeId?: string
): Promise<boolean> {
    try {
        const session = await auth();
        if (!session) return false;

        const existingModel = await prisma.model.findFirst({
            where: {
                modelNo,
                companyId: session.user.companyId,
                id: excludeId ? { not: excludeId } : undefined
            }
        });

        return !existingModel;
    } catch (error) {
        console.error('Check model number error:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}