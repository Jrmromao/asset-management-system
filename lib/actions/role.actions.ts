'use server';

import { PrismaClient, Prisma } from '@prisma/client'
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient()

type ActionReturn<T> = {
    data?: T;
    error?: string;
};

export async function getRoles(): Promise<ActionReturn<Role[]>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const roles = await prisma.role.findMany({
            where: {
                companyId: session.user.companyId,
            },
            orderBy: {
                name: 'asc'
            },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        return { data: parseStringify(roles) };
    } catch (error) {
        console.error('Get roles error:', error);
        return { error: "Failed to fetch roles" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function createRole(data: Pick<Role, 'name'>): Promise<ActionReturn<Role>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if role with same name exists in company
        const existingRole = await prisma.role.findFirst({
            where: {
                name: data.name,
                companyId: session.user.companyId,
            },
        });

        if (existingRole) {
            return { error: "Role with this name already exists" };
        }

        const role = await prisma.role.create({
            data: {
                name: data.name,
                companyId: session.user.companyId,
            },
        });

        revalidatePath('/roles');
        return { data: parseStringify(role) };
    } catch (error) {
        console.error('Create role error:', error);
        return { error: "Failed to create role" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function getRoleById(id: string): Promise<ActionReturn<Role>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        const role = await prisma.role.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                }
            }
        });

        if (!role) {
            return { error: "Role not found" };
        }

        return { data: parseStringify(role) };
    } catch (error) {
        console.error('Get role error:', error);
        return { error: "Failed to fetch role" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function updateRole(
    id: string,
    data: Pick<Role, 'name'>
): Promise<ActionReturn<Role>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if role exists and belongs to company
        const existingRole = await prisma.role.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
        });

        if (!existingRole) {
            return { error: "Role not found" };
        }

        // Check if new name conflicts with existing role
        if (data.name !== existingRole.name) {
            const nameExists = await prisma.role.findFirst({
                where: {
                    name: data.name,
                    companyId: session.user.companyId,
                    id: { not: id },
                },
            });

            if (nameExists) {
                return { error: "Role with this name already exists" };
            }
        }

        const role = await prisma.role.update({
            where: { id },
            data: {
                name: data.name,
            },
        });

        revalidatePath('/roles');
        revalidatePath(`/roles/${id}`);
        return { data: parseStringify(role) };
    } catch (error) {
        console.error('Update role error:', error);
        return { error: "Failed to update role" };
    } finally {
        await prisma.$disconnect();
    }
}

export async function deleteRole(id: string): Promise<ActionReturn<Role>> {
    try {
        const session = await auth();
        if (!session) {
            return { error: "Not authenticated" };
        }

        // Check if role exists and belongs to company
        const existingRole = await prisma.role.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                _count: {
                    select: { users: true }
                }
            }
        });

        if (!existingRole) {
            return { error: "Role not found" };
        }

        // Prevent deletion if role has users
        if (existingRole._count.users > 0) {
            return { error: "Cannot delete role with assigned users" };
        }

        const role = await prisma.role.delete({
            where: { id },
        });

        revalidatePath('/roles');
        return { data: parseStringify(role) };
    } catch (error) {
        console.error('Delete role error:', error);
        return { error: "Failed to delete role" };
    } finally {
        await prisma.$disconnect();
    }
}

// Utility function to check if role name is unique in company
export async function isRoleNameUnique(
    name: string,
    excludeId?: string
): Promise<boolean> {
    try {
        const session = await auth();
        if (!session) return false;

        const existingRole = await prisma.role.findFirst({
            where: {
                name,
                companyId: session.user.companyId,
                id: excludeId ? { not: excludeId } : undefined,
            },
        });

        return !existingRole;
    } catch (error) {
        console.error('Check role name error:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}