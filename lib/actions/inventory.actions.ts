"use server";

import { withAuth } from "@/lib/middleware/withAuth";
import { parseStringify } from "../utils";
import { inventorySchema } from "../schemas";
import { z } from "zod";
import type { Inventory } from "@prisma/client";
import { prisma } from "@/app/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// Add a local ActionResponse type if not present
export type ActionResponse<T = any> = {
  success?: boolean;
  data?: T;
  error?: string;
};

type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "purchaseDate";
  sortOrder?: "asc" | "desc";
}

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get('sb-access-token')?.value,
    refreshToken: cookieStore.get('sb-refresh-token')?.value
  };
};

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof inventorySchema>,
  ): Promise<AuthResponse<Inventory>> => {
    try {
      const validation = inventorySchema.safeParse(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }
      const inventory = await prisma.inventory.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata?.companyId,
        },
      });
      revalidatePath("/inventories");
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Create inventory error:", error);
      return { success: false, error: "Failed to create inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createInventory(values: z.infer<typeof inventorySchema>): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return insert(session, values);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<Inventory>,
  ): Promise<AuthResponse<Inventory>> => {
    try {
      if (!id) {
        return { success: false, error: "ID is required for update" };
      }
      const updated = await prisma.inventory.update({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        data: {
          name: data.name,
        },
      });
      revalidatePath("/inventories");
      return { success: true, data: parseStringify(updated) };
    } catch (error) {
      console.error("Update inventory error:", error);
      return { success: false, error: "Failed to update inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateInventory(id: string, data: Partial<Inventory>): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return update(session, id, data);
}

export const getAll = withAuth(async (user): Promise<AuthResponse<Inventory[]>> => {
  try {
    const inventories = await prisma.inventory.findMany({
      where: {
        companyId: user.user_metadata?.companyId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, data: parseStringify(inventories) };
  } catch (error) {
    console.error("Get inventories error:", error);
    return { success: false, error: "Failed to fetch inventories" };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrapper function for client-side use
export async function getAllInventories(): Promise<AuthResponse<Inventory[]>> {
  const session = getSession();
  return getAll(session);
}

export const getAllPaginated = withAuth(
  async (user, params?: PaginationParams): Promise<AuthResponse<Inventory[]>> => {
    try {
      if (!user.user_metadata?.companyId) {
        return { success: false, error: "Not authenticated" };
      }
      const items = await prisma.inventory.findMany({
        where: {
          companyId: user.user_metadata.companyId,
          ...(params?.search
            ? {
                name: { contains: params.search, mode: "insensitive" },
              }
            : {}),
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return { success: true, data: parseStringify(items) };
    } catch (error) {
      console.error("Get inventories error:", error);
      return { success: false, error: "Failed to fetch inventories" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getPaginatedInventories(params?: PaginationParams): Promise<AuthResponse<Inventory[]>> {
  const session = getSession();
  return getAllPaginated(session, params);
}

export const getInventoryById = withAuth(async (user, id: string): Promise<AuthResponse<Inventory>> => {
  try {
    const inventory = await prisma.inventory.findFirst({
      where: {
        id,
        companyId: user.user_metadata?.companyId,
      },
    });
    if (!inventory) {
      return { success: false, error: "Inventory not found" };
    }
    return { success: true, data: parseStringify(inventory) };
  } catch (error) {
    console.error("Get inventory error:", error);
    return { success: false, error: "Failed to fetch inventory" };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrapper function for client-side use
export async function getInventory(id: string): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return getInventoryById(session, id);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Inventory>> => {
    try {
      // Check if inventory is in use
      const inUse = await prisma.asset.findFirst({
        where: {
          id: id,
        },
      });
      if (inUse) {
        return {
          success: false,
          error: "Cannot delete inventory that is in use",
        };
      }
      const inventory = await prisma.inventory.delete({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
      });
      revalidatePath("/inventories");
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Delete inventory error:", error);
      return { success: false, error: "Failed to delete inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteInventory(id: string): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return remove(session, id);
}
