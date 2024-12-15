'use server';
import {parseStringify} from "@/lib/utils";
import {prisma} from "@/app/db";
import {auth} from "@/auth";
import {z} from "zod";
import {inventorySchema} from "@/lib/schemas";


interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'name' | 'createdAt' | 'purchaseDate';
    sortOrder?: 'asc' | 'desc';
}

export async function insert(values: z.infer<typeof inventorySchema>):
    Promise<ActionResponse<Inventory>> {
    try {
        const validation = inventorySchema.safeParse(values);
        if (!validation.success) {
            return {error: validation.error.errors[0].message};
        }

        // const session = await auth()
        const inventory = await prisma.inventory.create({
            data: {
                ...validation.data,
                company: {
                    connect: {
                        // id: session?.user?.companyId
                        id: 'bf40528b-ae07-4531-a801-ede53fb31f04'
                    }
                }
            },
        });


        return {data: parseStringify(inventory)};
    } catch (error) {
        console.error('Create inventory error:', error);
        return {error: "Failed to create inventory"};
    } finally {
        await prisma.$disconnect();
    }
}

export async function update(data: Inventory): Promise<ActionResponse<Inventory>> {
    try {
        if (!data.id) {
            return {error: 'ID is required for update'};
        }

        const session = await auth()

        const updated = await prisma.inventory.update({
            where: {
                id: data.id,
                companyId: session?.user?.companyId
            }
            ,
            data: {
                ...data,
            },
        });

        return {data: parseStringify(updated)};
    } catch (error) {
        console.error('Update inventory error:', error);
        return {error: "Failed to update inventory"};
    } finally {
        await prisma.$disconnect();
    }
}

export async function getAll(params?: PaginationParams) {
    try {
        const session = await auth();
        if (!session?.user?.companyId) {
            return { error: "Not authenticated" };
        }

        const inventories = await prisma.inventory.findMany({
            where: {
                companyId: session.user.companyId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: parseStringify(inventories)
        }
    } catch (error) {
        console.error('Get inventories error:', error);

        throw {
            success: false,
            error: "Failed to fetch inventories"
        };


    } finally {
        await prisma.$disconnect();
    }
}

// If you need pagination and search
export async function getAllPaginated(params?: PaginationParams) {
    try {
        const session = await auth();
        if (!session?.user?.companyId) {
            return {error: "Not authenticated"};
        }

        const items = await prisma.inventory.findMany({
            where: {
                companyId: session.user.companyId,
                ...(params?.search ? {
                    name: {contains: params.search, mode: 'insensitive'}
                } : {})
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return parseStringify(items);
    } catch (error) {
        console.error('Get inventories error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export async function findById(id: string): Promise<ActionResponse<Inventory>> {
    try {
        const session = await auth()
        const inventory = await prisma.inventory.findFirst({
            where: {
                id: id,
                companyId: session?.user?.companyId
            }
        });

        if (!inventory) {
            return {error: "Inventory not found"};
        }

        return {data: parseStringify(inventory)};
    } catch (error) {
        console.error('Get inventory error:', error);
        return {error: "Failed to fetch inventory"};
    } finally {
        await prisma.$disconnect();
    }
}

export async function remove(id: string): Promise<ActionResponse<Inventory>> {
    try {
        const session = await auth()

        // Check if inventory is in use
        const inUse = await prisma.asset.findFirst({
            where: {
                id: id
            }
        });

        if (inUse) {
            return {error: "Cannot delete inventory that is in use"};
        }

        const inventory = await prisma.inventory.delete({
            where: {
                id: id,
                companyId: session?.user?.companyId
            }
        });

        return {data: parseStringify(inventory)};
    } catch (error) {
        console.error('Delete inventory error:', error);
        return {error: "Failed to delete inventory"};
    } finally {
        await prisma.$disconnect();
    }
}