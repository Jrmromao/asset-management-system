"use server";

import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { parseStringify } from "../utils";
import { inventorySchema } from "../schemas";
import { z } from "zod";
import type { Inventory } from "@prisma/client";
import { prisma } from "@/app/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";



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
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
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
        return { success: false, data: null as any, error: validation.error.errors[0].message };
      }
      
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const inventory = await prisma.inventory.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata.companyId,
        },
      });
      revalidatePath("/inventories");
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Create inventory error:", error);
      return { success: false, data: null as any, error: "Failed to create inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// ... existing code ...

// Add a local ActionResponse type if not present
export type ActionResponse<T = any> = {
  success?: boolean;
  data?: T;
  error?: string;
};

// type AuthResponse<T> = {
//   data?: T;
//   error?: string;
//   success: boolean;
// };

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "purchaseDate";
  sortOrder?: "asc" | "desc";
}




// Wrapper function for client-side use
export async function createInventory(
  values: z.infer<typeof inventorySchema>,
): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return insert(values);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<Inventory>,
  ): Promise<AuthResponse<Inventory>> => {
    try {
      if (!id) {
        return { success: false, data: null as any, error: "ID is required for update" };
      }
      
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { 
          success: false,
          data: null as any,
          error: "User is not associated with a company"
        };
      }
      
      const updated = await prisma.inventory.update({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
        data: {
          name: data.name,
        },
      });
      revalidatePath("/inventories");
      return { success: true, data: parseStringify(updated) };
    } catch (error) {
      console.error("Update inventory error:", error);
      return { success: false, data: null as any, error: "Failed to update inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateInventory(
  id: string,
  data: Partial<Inventory>,
): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return update(id, data);
}

export const getAll = withAuth(
  async (user): Promise<AuthResponse<Inventory[]>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const inventories = await prisma.inventory.findMany({
        where: {
          companyId: user.user_metadata.companyId,
        },
        orderBy: {
          name: "asc",
        },
      });
      return { success: true, data: parseStringify(inventories) };
    } catch (error) {
      console.error("Get inventories error:", error);
      return { success: false, data: null as any, error: "Failed to fetch inventories" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllInventories(): Promise<AuthResponse<Inventory[]>> {
  const session = getSession();
  return getAll();
}

export const getAllPaginated = withAuth(
  async (
    user,
    params?: PaginationParams,
  ): Promise<AuthResponse<Inventory[]>> => {
    try {
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
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
      return { success: false, data: null as any, error: "Failed to fetch inventories" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getPaginatedInventories(
  params?: PaginationParams,
): Promise<AuthResponse<Inventory[]>> {
  const session = getSession();
  return getAllPaginated(params);
}

export const getInventoryById = withAuth(
  async (user, id: string): Promise<AuthResponse<Inventory>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const inventory = await prisma.inventory.findFirst({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });
      if (!inventory) {
        return { success: false, data: null as any, error: "Inventory not found" };
      }
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Get inventory error:", error);
      return { success: false, data: null as any, error: "Failed to fetch inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getInventory(
  id: string,
): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return getInventoryById( id);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Inventory>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      // Check if inventory is in use by assets
      const inUseByAssets = await prisma.asset.findFirst({
        where: {
          inventoryId: id,
          companyId: user.user_metadata.companyId,
        },
      });
      
      if (inUseByAssets) {
        return {
          success: false,
          data: null as any,
          error: "Cannot delete inventory that is in use by assets",
        };
      }
      
      // Check if inventory is in use by accessories
      const inUseByAccessories = await prisma.accessory.findFirst({
        where: {
          inventoryId: id,
          companyId: user.user_metadata.companyId,
        },
      });
      
      if (inUseByAccessories) {
        return {
          success: false,
          data: null as any,
          error: "Cannot delete inventory that is in use by accessories",
        };
      }
      
      // Check if inventory is in use by licenses
      const inUseByLicenses = await prisma.license.findFirst({
        where: {
          inventoryId: id,
          companyId: user.user_metadata.companyId,
        },
      });
      
      if (inUseByLicenses) {
        return {
          success: false,
          data: null as any,
          error: "Cannot delete inventory that is in use by licenses",
        };
      }
      
      const inventory = await prisma.inventory.delete({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
      });
      revalidatePath("/inventories");
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Delete inventory error:", error);
      return { success: false, data: null as any, error: "Failed to delete inventory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteInventory(
  id: string,
): Promise<AuthResponse<Inventory>> {
  const session = getSession();
  return remove(id);
}

export const getMaintenanceDueCount = withAuth(
  async (user): Promise<AuthResponse<number>> => {
    try {
      // In a real scenario, you would fetch this data from your database
      // For now, we'll return a static value
      const count = 5;
      return { success: true, data: count };
    } catch (error) {
      console.error("Get maintenance due count error:", error);
      return { success: false, data: null as any, error: "Failed to fetch maintenance due count" };
    }
  }
);

export const getMaintenanceSchedule = withAuth(
  async (user): Promise<AuthResponse<any[]>> => {
    try {
      // In a real scenario, you would fetch this data from your database
      // For now, we'll return a static list
      const schedule = [
        {
          asset: "Laptop XPS-15",
          type: "Routine Check",
          dueDate: "Tomorrow",
          priority: "high",
          impact: 25,
        },
        {
          asset: "Monitor U2719D",
          type: "Calibration",
          dueDate: "Next Week",
          priority: "medium",
          impact: 15,
        },
        {
          asset: "Mobile Device",
          type: "Battery Check",
          dueDate: "2 Weeks",
          priority: "low",
          impact: 10,
        },
      ];
      return { success: true, data: schedule };
    } catch (error) {
      console.error("Get maintenance schedule error:", error);
      return { success: false, data: [], error: "Failed to fetch maintenance schedule" };
    }
  }
);