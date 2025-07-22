"use server";

import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { parseStringify } from "../utils";
import { inventorySchema } from "../schemas";
import { z } from "zod";
import type { Inventory } from "@prisma/client";
import { prisma } from "@/app/db";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "name" | "createdAt" | "purchaseDate";
  sortOrder?: "asc" | "desc";
}

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof inventorySchema>,
  ): Promise<AuthResponse<Inventory>> => {
    console.log("\n\n\n [inventory.actions] insert - Starting with user:", {
      userId: user?.id,
      privateMetadata: user?.privateMetadata,
      hasCompanyId: !!user?.privateMetadata?.companyId,
    });

    try {
      const validation = inventorySchema.safeParse(values);
      console.log(
        " [inventory.actions] insert - Validation result:",
        validation,
      );

      if (!validation.success) {
        console.error(
          "❌ [inventory.actions] insert - Validation failed:",
          validation.error.errors,
        );
        return {
          success: false,
          data: null as any,
          error: validation.error.errors[0].message,
        };
      }

      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        console.error(
          "❌ [inventory.actions] insert - User missing companyId in private metadata:",
          {
            user: user?.id,
            privateMetadata: user?.privateMetadata,
          },
        );
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      console.log(
        "✅ [inventory.actions] insert - Creating inventory with data:",
        {
          ...validation.data,
          companyId,
        },
      );

      const inventory = await prisma.inventory.create({
        data: {
          ...validation.data,
          companyId,
        },
      });

      console.log(
        "✅ [inventory.actions] insert - Inventory created successfully:",
        inventory,
      );
      revalidatePath("/inventories");
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "INVENTORY_CREATED",
        entity: "INVENTORY",
        entityId: inventory.id,
        details: `Inventory created: ${inventory.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("❌ [inventory.actions] insert - Database error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to create inventory",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createInventory(
  values: z.infer<typeof inventorySchema>,
): Promise<AuthResponse<Inventory>> {
  console.log(
    " [inventory.actions] createInventory - Called with values:",
    values,
  );
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
        return {
          success: false,
          data: null as any,
          error: "ID is required for update",
        };
      }

      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const updated = await prisma.inventory.update({
        where: {
          id,
          companyId,
        },
        data: {
          name: data.name,
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
        },
      });
      revalidatePath("/inventories");
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "INVENTORY_UPDATED",
        entity: "INVENTORY",
        entityId: id,
        details: `Inventory updated: ${updated.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(updated) };
    } catch (error) {
      console.error("Update inventory error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to update inventory",
      };
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
  return update(id, data);
}

export const getAll = withAuth(
  async (user): Promise<AuthResponse<Inventory[]>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const inventories = await prisma.inventory.findMany({
        where: {
          companyId,
        },
        orderBy: {
          name: "asc",
        },
      });
      return { success: true, data: parseStringify(inventories) };
    } catch (error) {
      console.error("Get inventories error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch inventories",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllInventories(): Promise<AuthResponse<Inventory[]>> {
  return getAll();
}

export const getAllPaginated = withAuth(
  async (
    user,
    params?: PaginationParams,
  ): Promise<AuthResponse<Inventory[]>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const items = await prisma.inventory.findMany({
        where: {
          companyId,
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
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch inventories",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getPaginatedInventories(
  params?: PaginationParams,
): Promise<AuthResponse<Inventory[]>> {
  return getAllPaginated(params);
}

export const getInventoryById = withAuth(
  async (user, id: string): Promise<AuthResponse<Inventory>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const inventory = await prisma.inventory.findFirst({
        where: {
          id,
          companyId,
        },
      });
      if (!inventory) {
        return {
          success: false,
          data: null as any,
          error: "Inventory not found",
        };
      }
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Get inventory error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch inventory",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getInventory(
  id: string,
): Promise<AuthResponse<Inventory>> {
  return getInventoryById(id);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Inventory>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      // Check if inventory is in use by assets
      const inUseByAssets = await prisma.asset.findFirst({
        where: {
          inventoryId: id,
          companyId,
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
          companyId,
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
          companyId,
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
          companyId,
        },
      });
      revalidatePath("/inventories");
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "INVENTORY_DELETED",
        entity: "INVENTORY",
        entityId: id,
        details: `Inventory deleted: ${inventory.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(inventory) };
    } catch (error) {
      console.error("Delete inventory error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to delete inventory",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteInventory(
  id: string,
): Promise<AuthResponse<Inventory>> {
  return remove(id);
}

export const getMaintenanceDueCount = withAuth(
  async (user): Promise<AuthResponse<number>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      // Get assets that have maintenance due within the next 30 days
      const maintenanceDueAssets = await prisma.asset.findMany({
        where: {
          companyId,
          nextMaintenance: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            gte: new Date(), // From today
          },
          active: true,
        },
        select: {
          id: true,
          name: true,
          nextMaintenance: true,
        },
      });

      return { success: true, data: maintenanceDueAssets.length };
    } catch (error) {
      console.error("Get maintenance due count error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch maintenance due count",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getMaintenanceSchedule = withAuth(
  async (user): Promise<AuthResponse<any[]>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      // Get assets with upcoming maintenance
      const maintenanceSchedule = await prisma.asset.findMany({
        where: {
          companyId,
          nextMaintenance: {
            gte: new Date(),
          },
          active: true,
        },
        select: {
          id: true,
          name: true,
          nextMaintenance: true,
          model: {
            select: {
              name: true,
            },
          },
          statusLabel: {
            select: {
              name: true,
              colorCode: true,
            },
          },
        },
        orderBy: {
          nextMaintenance: "asc",
        },
        take: 10, // Limit to 10 upcoming maintenance items
      });

      const formattedSchedule = maintenanceSchedule.map((asset) => {
        const daysUntil = Math.ceil(
          (asset.nextMaintenance!.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        );

        let priority = "low";
        let impact = 10;

        if (daysUntil <= 7) {
          priority = "high";
          impact = 25;
        } else if (daysUntil <= 14) {
          priority = "medium";
          impact = 15;
        }

        return {
          asset: asset.name,
          type: asset.model?.name || "Maintenance",
          dueDate:
            daysUntil === 0
              ? "Today"
              : daysUntil === 1
                ? "Tomorrow"
                : daysUntil <= 7
                  ? `${daysUntil} days`
                  : `${Math.ceil(daysUntil / 7)} weeks`,
          priority,
          impact,
          assetId: asset.id,
          status: asset.statusLabel?.name || "Unknown",
        };
      });

      return { success: true, data: formattedSchedule };
    } catch (error) {
      console.error("Get maintenance schedule error:", error);
      return {
        success: false,
        data: [],
        error: "Failed to fetch maintenance schedule",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
