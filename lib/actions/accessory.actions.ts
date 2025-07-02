"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents } from "@/lib/utils";
import { z } from "zod";
import { accessorySchema, assignmentSchema } from "@/lib/schemas";
import { getAuditLog, createAuditLog } from "@/lib/actions/auditLog.actions";
import { revalidatePath } from "next/cache";
import { ItemType, Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { withAuth } from "@/lib/middleware/withAuth";
import { getEnhancedAccessoryById } from "@/lib/services/accessory.service";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
  message?: string;
};

const getSession = async () => {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof accessorySchema>,
  ): Promise<ActionResponse<Accessory>> => {
    console.log(" [accessory.actions] insert - Starting with user:", {
      userId: user?.id,
      privateMetadata: user?.privateMetadata,
      hasCompanyId: !!user?.privateMetadata?.companyId,
    });

    try {
      const validation = accessorySchema.safeParse(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }

      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        console.error(
          "❌ [accessory.actions] insert - User missing companyId in private metadata:",
          {
            user: user?.id,
            privateMetadata: user?.privateMetadata,
          },
        );
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      console.log(
        "✅ [accessory.actions] insert - Creating accessory with data:",
        {
          ...values,
          companyId,
        },
      );

      const result = await prisma.$transaction(async (tx) => {
        // Find the internal user record for audit logging
        const internalUser = await tx.user.findFirst({
          where: { oauthId: user.id, companyId },
          select: { id: true },
        });

        if (!internalUser) {
          throw new Error("Internal user record not found for audit logging");
        }

        const accessory = await tx.accessory.create({
          data: {
            name: values.name,
            alertEmail: values.alertEmail,
            serialNumber: values.serialNumber,
            reorderPoint: Number(values.reorderPoint),
            totalQuantityCount: Number(values.totalQuantityCount),
            modelNumber: values.modelNumber,
            companyId: companyId,
            statusLabelId: values.statusLabelId,
            departmentId: values.departmentId,
            locationId: values.locationId,
            inventoryId: values.inventoryId,
            categoryId: values.categoryId,

            // Enhanced pricing fields
            price: values.price ? parseFloat(values.price) : null,
            unitCost: values.unitCost ? parseFloat(values.unitCost) : null,
            totalValue: values.totalValue
              ? parseFloat(values.totalValue)
              : null,
            currency: values.currency || "USD",
            depreciationRate: values.depreciationRate
              ? parseFloat(values.depreciationRate)
              : null,
            currentValue: values.currentValue
              ? parseFloat(values.currentValue)
              : null,
            replacementCost: values.replacementCost
              ? parseFloat(values.replacementCost)
              : null,
            averageCostPerUnit: values.averageCostPerUnit
              ? parseFloat(values.averageCostPerUnit)
              : null,
            lastPurchasePrice: values.lastPurchasePrice
              ? parseFloat(values.lastPurchasePrice)
              : null,
            costCenter: values.costCenter || null,
            budgetCode: values.budgetCode || null,

            // Purchase and physical fields
            poNumber: values.poNumber || null,
            purchaseDate: values.purchaseDate || null,
            endOfLife: values.endOfLife || null,
            material: values.material || null,
            weight: values.weight ? parseFloat(values.weight) : null,
            notes: values.notes || null,

            // Supplier field
            supplierId: values.supplierId || null,
          },
        });

        await tx.accessoryStock.create({
          data: {
            accessoryId: accessory.id,
            quantity: Number(values.totalQuantityCount),
            type: "purchase",
            companyId: companyId,
            notes: `Initial stock purchase of ${values.totalQuantityCount} units`,
          },
        });

        return { accessory, internalUserId: internalUser.id };
      });

      await createAuditLog({
        companyId: companyId,
        action: "ACCESSORY_CREATED",
        entity: "ACCESSORY",
        entityId: result.accessory.id,
        details: `Created accessory ${values.name} with initial stock of ${values.totalQuantityCount} units`,
      });

      console.log(
        "✅ [accessory.actions] insert - Accessory created successfully",
      );
      return {
        success: true,
        data: parseStringify(result.accessory),
      };
    } catch (error) {
      console.error("❌ [accessory.actions] insert - Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createAccessory(
  values: z.infer<typeof accessorySchema>,
): Promise<ActionResponse<Accessory>> {
  const session = await getSession();
  return insert(values);
}

export const getAll = withAuth(
  async (user): Promise<ActionResponse<Accessory[]>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const accessories = await prisma.accessory.findMany({
        include: {
          company: true,
          supplier: true,
          inventory: true,
          statusLabel: true,
        },
        where: {
          companyId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return {
        success: true,
        data: parseStringify(accessories),
      };
    } catch (error) {
      console.error("Error fetching accessories:", error);
      return { success: false, error: "Failed to fetch accessories" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllAccessories(): Promise<
  ActionResponse<Accessory[]>
> {
  const session = await getSession();
  return getAll();
}

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<any>> => {
    try {
      const companyId = user.privateMetadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }
      const data = await getEnhancedAccessoryById(id, companyId);
      if (!data) {
        return { success: false, error: "Accessory not found" };
      }
      return { success: true, data };
    } catch (error) {
      console.error("Error finding accessory:", error);
      return { success: false, error: "Failed to find accessory" };
    }
  },
);

// Wrapper function for client-side use
export async function getAccessory(
  id: string,
): Promise<ActionResponse<Accessory>> {
  const session = getSession();
  return findById(id);
}

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Accessory>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      // Get accessory info before deletion for audit log
      const accessory = await prisma.accessory.findUnique({
        where: { id, companyId },
      });

      const deletedAccessory = await prisma.accessory.delete({
        where: {
          id,
          companyId,
        },
      });

      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "ACCESSORY_DELETED",
        entity: "ACCESSORY",
        entityId: id,
        details: accessory ? `Accessory deleted: ${accessory.name} (${accessory.serialNumber}) by user ${user.id}` : `Accessory deleted (ID: ${id}) by user ${user.id}`,
      });

      revalidatePath("/accessories");
      return {
        success: true,
        data: parseStringify(deletedAccessory),
      };
    } catch (error) {
      console.error("Error deleting accessory:", error);
      return { success: false, error: "Failed to delete accessory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteAccessory(
  id: string,
): Promise<ActionResponse<Accessory>> {
  const session = getSession();
  return remove(id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<Accessory>,
  ): Promise<ActionResponse<Accessory>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const accessory = await prisma.accessory.update({
        where: {
          id,
          companyId,
        },
        data: {
          name: data.name,
          alertEmail: data.alertEmail,
          serialNumber: data.serialNumber || "",
          reorderPoint: data.reorderPoint,
          totalQuantityCount: data.totalQuantityCount,
          modelNumber: data.modelNumber,
          statusLabelId: data.statusLabelId,
          departmentId: data.departmentId,
          locationId: data.locationId,
          inventoryId: data.inventoryId,
          categoryId: data.categoryId,
        },
      });

      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "ACCESSORY_UPDATED",
        entity: "ACCESSORY",
        entityId: id,
        details: `Accessory updated: ${accessory.name} (${accessory.serialNumber}) by user ${user.id}`,
      });

      revalidatePath("/accessories");
      revalidatePath(`/accessories/${id}`);
      return {
        success: true,
        data: parseStringify(accessory),
      };
    } catch (error) {
      console.error("Error updating accessory:", error);
      return { success: false, error: "Failed to update accessory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateAccessory(
  id: string,
  data: Partial<Accessory>,
): Promise<ActionResponse<Accessory>> {
  const session = getSession();
  return update(id, data);
}

export const processAccessoryCSV = withAuth(
  async (user, csvContent: string): Promise<ActionResponse<Accessory[]>> => {
    try {
      const data = processRecordContents(csvContent);
      const companyId = user.user_metadata?.companyId;

      const records = await prisma.$transaction(async (tx) => {
        const recordPromises = data.map(async (item) => {
          const [statusLabel, supplier, location, department, inventory] =
            await Promise.all([
              tx.statusLabel.findFirst({
                where: { name: item["statusLabel"] },
              }),
              tx.supplier.findFirst({ where: { name: item["supplier"] } }),
              tx.departmentLocation.findFirst({
                where: { name: item["location"] },
              }),
              tx.department.findFirst({ where: { name: item["department"] } }),
              tx.inventory.findFirst({ where: { name: item["inventory"] } }),
            ]);

          if (!statusLabel || !supplier) {
            console.warn(
              `Skipping record: Missing required associations for model="${item["model"]}", statusLabel="${item["statusLabel"]}", supplier="${item["supplier"]}"`,
            );
            return null;
          }

          return tx.accessory.create({
            data: {
              name: item["name"],
              purchaseDate: item["purchaseDate"],
              endOfLife: item["endOfLife"],
              alertEmail: item["alertEmail"],
              modelNumber: item["modelNumber"],
              statusLabelId: statusLabel?.id,
              departmentId: department?.id || null,
              locationId: location?.id || null,
              price: parseFloat(item["price"]) || 0,
              companyId,
              reorderPoint: Number(item["reorderPoint"]) || 0,
              totalQuantityCount: Number(item["totalQuantityCount"]) || 0,
              material: item["material"],
              weight: item["weight"],
              supplierId: supplier?.id,
              inventoryId: inventory?.id || null,
              poNumber: item["poNumber"],
              notes: item["notes"],
            },
          });
        });

        revalidatePath("/accessories");
        return (await Promise.all(recordPromises)).filter(Boolean);
      });

      revalidatePath("/assets");

      return {
        success: true,
        message: `Successfully processed ${records.length} records`,
        data: parseStringify(records),
      };
    } catch (error) {
      console.error("Error processing CSV:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to process CSV file",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function processAccessoriesCSV(
  csvContent: string,
): Promise<ActionResponse<Accessory[]>> {
  const session = getSession();
  return processAccessoryCSV(csvContent);
}

export const checkout = withAuth(
  async (
    user,
    values: z.infer<typeof assignmentSchema>,
  ): Promise<ActionResponse<any>> => {
    try {
      // Basic validation
      const basicValidation = z
        .object({
          userId: z.string().min(1, "User ID is required"),
          itemId: z.string().min(1, "Accessory ID is required"),
          type: z.enum(["accessory"]),
          quantity: z.number().optional().default(1),
        })
        .safeParse(values);

      if (!basicValidation.success) {
        return {
          success: false,
          error: basicValidation.error.errors[0].message,
        };
      }

      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        // Find the internal user record for audit logging
        const internalUser = await tx.user.findFirst({
          where: { oauthId: user.id, companyId },
          select: { id: true },
        });

        if (!internalUser) {
          throw new Error("Internal user record not found for audit logging");
        }

        // Verify the user exists in the company
        const assigneeUser = await tx.user.findFirst({
          where: { id: values.userId, companyId },
          select: { id: true, name: true, email: true },
        });

        if (!assigneeUser) {
          throw new Error("Assignee user not found in company");
        }

        // Get the accessory
        const accessory = await tx.accessory.findUnique({
          where: { id: values.itemId, companyId },
        });

        if (!accessory) {
          throw new Error("Accessory not found");
        }

        // Check total assigned quantity for this accessory
        const assignedUnits = await tx.userItem.aggregate({
          where: {
            accessoryId: values.itemId,
            itemType: "ACCESSORY",
            companyId,
          },
          _sum: { quantity: true },
        });
        const totalAssigned = assignedUnits._sum.quantity || 0;
        const availableUnits = accessory.totalQuantityCount - totalAssigned;
        const requestedUnits = values.quantity || 1;

        if (requestedUnits > availableUnits) {
          throw new Error(
            `Not enough units available. Requested: ${requestedUnits}, Available: ${availableUnits}`,
          );
        }

        // Check if user already has this accessory assigned
        const userAlreadyAssigned = await tx.userItem.findFirst({
          where: {
            userId: values.userId,
            accessoryId: values.itemId,
            itemType: "ACCESSORY",
            companyId,
          },
        });

        if (userAlreadyAssigned) {
          throw new Error("Accessory is already assigned to this user");
        }

        // Create the assignment with quantity
        const userItem = await tx.userItem.create({
          data: {
            userId: values.userId,
            accessoryId: values.itemId,
            itemType: "ACCESSORY",
            quantity: requestedUnits,
            companyId: companyId,
          },
        });

        return { accessory, internalUserId: internalUser.id, assigneeUser };
      });

      await createAuditLog({
        companyId: companyId,
        action: "ACCESSORY_ASSIGNED",
        entity: "ACCESSORY",
        entityId: result.accessory.id,
        details: `Accessory ${result.accessory.name} assigned to user ${result.assigneeUser.name || result.assigneeUser.email} by internal user ID ${result.internalUserId}`,
      });

      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error("Error assigning accessory:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function checkoutAccessory(
  values: z.infer<typeof assignmentSchema>,
): Promise<ActionResponse<any>> {
  const session = getSession();
  return checkout(values);
}

export const checkin = withAuth(
  async (user, userAccessoryId: string): Promise<ActionResponse<Accessory>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const result = await prisma.$transaction(async (tx) => {
        // Find the internal user record for audit logging
        const internalUser = await tx.user.findFirst({
          where: { oauthId: user.id, companyId },
          select: { id: true },
        });

        if (!internalUser) {
          throw new Error("Internal user record not found for audit logging");
        }

        // Find and delete the user item assignment
        const userItem = await tx.userItem.findUnique({
          where: { id: userAccessoryId },
          include: {
            user: { select: { name: true, email: true } },
          },
        });

        if (!userItem || userItem.companyId !== companyId) {
          throw new Error("Assignment not found or not authorized");
        }

        await tx.userItem.delete({
          where: { id: userAccessoryId },
        });

        // Get the updated accessory
        const accessory = await tx.accessory.findUnique({
          where: { id: userItem.accessoryId || "" },
        });

        if (!accessory) {
          throw new Error("Accessory not found");
        }

        return { accessory, internalUserId: internalUser.id, userItem };
      });

      await createAuditLog({
        companyId: companyId,
        action: "ACCESSORY_CHECKIN",
        entity: "ACCESSORY",
        entityId: result.accessory.id,
        details: `Accessory ${result.accessory.name} checked in from user ${result.userItem.user?.name || result.userItem.user?.email}`,
      });

      return { success: true, data: parseStringify(result.accessory) };
    } catch (error) {
      console.error("Error checking in accessory:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function checkinAccessory(
  userAccessoryId: string,
): Promise<ActionResponse<Accessory>> {
  const session = getSession();
  return checkin(userAccessoryId);
}
