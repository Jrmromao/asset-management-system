'use server';

import { PrismaClient, Prisma } from "@prisma/client";
import { Supplier } from "@/types";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type ActionReturn<T> = {
    data?: T;
    error?: string;
};

export async function insert(data: Supplier): Promise<ActionReturn<Supplier>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check for unique email
        const existingSupplier = await prisma.supplier.findUnique({
            where: { email: data.email },
        });

        if (existingSupplier) {
            return { error: "A supplier with this email already exists" };
        }

        const supplier = await prisma.supplier.create({
            data: {
                name: data.name,
                contactName: data.contactName,
                email: data.email,
                phoneNum: data.phoneNum || null,
                url: data.url || null,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                zip: data.zip,
                country: data.country,
                notes: data.notes || null,
            },
        });

        revalidatePath('/suppliers');
        return { data: parseStringify(supplier) };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: "A supplier with this email already exists" };
            }
        }
        console.error('Create supplier error:', error);
        return { error: "Failed to create supplier" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function getAll(params?: {
    search?: string;
}): Promise<ActionReturn<Supplier[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const where: Prisma.SupplierWhereInput = {
            ...(params?.search && {
                OR: [
                    { name: { contains: params.search, mode: 'insensitive' } },
                    { contactName: { contains: params.search, mode: 'insensitive' } },
                    { email: { contains: params.search, mode: 'insensitive' } },
                    { city: { contains: params.search, mode: 'insensitive' } },
                    { country: { contains: params.search, mode: 'insensitive' } },
                ],
            }),
        };

        const suppliers = await prisma.supplier.findMany({
            where,
            include: {
                _count: {
                    select: { assets: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return { data: parseStringify(suppliers) };
    } catch (error) {
        console.error('Get suppliers error:', error);
        return { error: "Failed to fetch suppliers" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function findById(id: string): Promise<ActionReturn<Supplier>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const supplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
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

        if (!supplier) {
            return { error: "Supplier not found" };
        }

        return { data: parseStringify(supplier) };
    } catch (error) {
        console.error('Find supplier error:', error);
        return { error: "Failed to fetch supplier" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function update(
    id: string,
    data: Supplier
): Promise<ActionReturn<Supplier>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if supplier exists
        const existingSupplier = await prisma.supplier.findUnique({
            where: { id },
        });

        if (!existingSupplier) {
            return { error: "Supplier not found" };
        }

        // Check email uniqueness if email is being changed
        if (data.email !== existingSupplier.email) {
            const emailExists = await prisma.supplier.findUnique({
                where: { email: data.email },
            });

            if (emailExists) {
                return { error: "A supplier with this email already exists" };
            }
        }

        const supplier = await prisma.supplier.update({
            where: { id },
            data: {
                name: data.name,
                contactName: data.contactName,
                email: data.email,
                phoneNum: data.phoneNum || null,
                url: data.url || null,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                zip: data.zip,
                country: data.country,
                notes: data.notes || null,
            },
        });

        revalidatePath('/suppliers');
        revalidatePath(`/suppliers/${id}`);
        return { data: parseStringify(supplier) };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return { error: "A supplier with this email already exists" };
            }
        }
        console.error('Update supplier error:', error);
        return { error: "Failed to update supplier" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function remove(id: string): Promise<ActionReturn<Supplier>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if supplier exists and has no related assets
        const existingSupplier = await prisma.supplier.findUnique({
            where: { id },
            include: {
                assets: {
                    select: { id: true },
                    take: 1,
                },
            },
        });

        if (!existingSupplier) {
            return { error: "Supplier not found" };
        }

        if (existingSupplier.assets.length > 0) {
            return { error: "Cannot delete supplier with associated assets" };
        }

        const supplier = await prisma.supplier.delete({
            where: { id },
        });

        revalidatePath('/suppliers');
        return { data: parseStringify(supplier) };
    } catch (error) {
        console.error('Delete supplier error:', error);
        return { error: "Failed to delete supplier" };
    } finally {
        await prisma.$disconnect();
    }
}