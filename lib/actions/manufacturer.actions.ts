'use server';

import { PrismaClient, Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { manufacturerSchema } from "@/lib/schemas";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const prisma = new PrismaClient();

type ActionResponse<T> = {
    data?: T;
    error?: string;
};


export async function insert(
    values: z.infer<typeof manufacturerSchema>
): Promise<ActionResponse<Manufacturer>> {
    try {

        const validation = manufacturerSchema.safeParse(values);
        if (!validation.success) {
            return { error: validation.error.errors[0].message };
        }

        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const manufacturer = await prisma.manufacturer.create({
            data: {
                ...validation.data,
                companyId: session.user.companyId,
                supportPhone: values.supportPhone || null,
                supportEmail: values.supportEmail || null,
            },
        });

        revalidatePath('/assets/create');
        return { data: parseStringify(manufacturer) };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: "A manufacturer with this name already exists" };
            }
        }
        console.error('Create manufacturer error:', error);
        return { error: "Failed to create manufacturer" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function getAll(params?: {
    search?: string;
}): Promise<ActionResponse<Manufacturer[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const where: Prisma.ManufacturerWhereInput = {
            companyId: session.user.companyId,
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search, mode: 'insensitive' } },
                    { supportEmail: { contains: params.search, mode: 'insensitive' } },
                ],
            }),
        };

        const manufacturers = await prisma.manufacturer.findMany({
            where,
            include: {
                _count: {
                    select: { models: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return { data: parseStringify(manufacturers) };
    } catch (error) {
        console.error('Get manufacturers error:', error);
        return { error: "Failed to fetch manufacturers" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function findById(id: string): Promise<ActionResponse<Manufacturer>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const manufacturer = await prisma.manufacturer.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                models: {
                    select: {
                        id: true,
                        name: true,
                        modelNo: true,
                    }
                }
            }
        });

        if (!manufacturer) {
            return { error: "Manufacturer not found" };
        }

        return { data: parseStringify(manufacturer) };
    } catch (error) {
        console.error('Find manufacturer error:', error);
        return { error: "Failed to fetch manufacturer" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function update(
    id: string,
    values: z.infer<typeof manufacturerSchema>
): Promise<ActionResponse<Manufacturer>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const validation = manufacturerSchema.safeParse(values);
        if (!validation.success) {
            return { error: validation.error.errors[0].message };
        }

        // Check if manufacturer exists and belongs to company
        const existingManufacturer = await prisma.manufacturer.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
        });

        if (!existingManufacturer) {
            return { error: "Manufacturer not found" };
        }

        const manufacturer = await prisma.manufacturer.update({
            where: { id },
            data: {
                ...validation.data,
                supportPhone: values.supportPhone || null,
                supportEmail: values.supportEmail || null,
            },
        });

        revalidatePath('/manufacturers');
        revalidatePath(`/manufacturers/${id}`);
        return { data: parseStringify(manufacturer) };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: "A manufacturer with this name already exists" };
            }
        }
        console.error('Update manufacturer error:', error);
        return { error: "Failed to update manufacturer" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function remove(id: string): Promise<ActionResponse<Manufacturer>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if manufacturer exists and belongs to company
        const existingManufacturer = await prisma.manufacturer.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                models: {
                    select: { id: true },
                    take: 1,
                },
            },
        });

        if (!existingManufacturer) {
            return { error: "Manufacturer not found" };
        }

        // Check for related models
        if (existingManufacturer.models.length > 0) {
            return { error: "Cannot delete manufacturer with associated models" };
        }

        const manufacturer = await prisma.manufacturer.delete({
            where: { id },
        });

        revalidatePath('/manufacturers');
        return { data: parseStringify(manufacturer) };
    } catch (error) {
        console.error('Delete manufacturer error:', error);
        return { error: "Failed to delete manufacturer" };
    } finally {
        await prisma.$disconnect();
    }
}

// Utility function to check if a manufacturer name is unique in the company
export async function isManufacturerNameUnique(
    name: string,
    excludeId?: string
): Promise<boolean> {
    try {
        const session = await auth();
        if (!session) return false;

        const manufacturer = await prisma.manufacturer.findFirst({
            where: {
                name,
                companyId: session.user.companyId,
                id: excludeId ? { not: excludeId } : undefined,
            },
            select: { id: true },
        });

        return !manufacturer;
    } catch (error) {
        console.error('Check manufacturer name error:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}