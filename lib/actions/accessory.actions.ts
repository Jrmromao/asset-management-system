"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents } from "@/lib/utils";
import { z } from "zod";
import { accessorySchema, assignmentSchema } from "@/lib/schemas";
import { getAuditLog } from "@/lib/actions/auditLog.actions";
import { revalidatePath } from "next/cache";
import { ItemType, Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { withAuth } from "@/lib/middleware/withAuth";

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

        await tx.auditLog.create({
          data: {
            action: "ACCESSORY_CREATED",
            entity: "ACCESSORY",
            entityId: accessory.id,
            userId: internalUser.id,
            companyId: companyId,
            details: `Created accessory ${values.name} with initial stock of ${values.totalQuantityCount} units`,
          },
        });

        return accessory;
      });

      console.log(
        "✅ [accessory.actions] insert - Accessory created successfully",
      );
      return {
        success: true,
        data: parseStringify(result),
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

      const accessoryQuery = {
        where: {
          id,
          companyId,
        },
        include: {
          company: true,
          supplier: true,
          inventory: true,
          statusLabel: true,
          department: true,
          category: true,
          departmentLocation: true,
          userItems: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  title: true,
                  employeeId: true,
                  active: true,
                },
              },
            },
          },
          AccessoryStock: {
            orderBy: {
              date: "desc",
            },
          },
        },
      } as const;

      const [accessory, auditLogsResult] = await Promise.all([
        prisma.accessory.findUnique(accessoryQuery),
        getAuditLog(id),
      ]);

      if (!accessory) {
        return { success: false, error: "Accessory not found" };
      }

      const accessoryWithComputedFields = {
        ...accessory,
        auditLogs: auditLogsResult.success ? auditLogsResult.data : [],
        userAccessories: accessory.userItems,
        currentAssignments: accessory.userItems,
      };

      return {
        success: true,
        data: parseStringify(accessoryWithComputedFields),
      };
    } catch (error) {
      console.error("Error finding accessory:", error);
      return { success: false, error: "Failed to find accessory" };
    } finally {
      await prisma.$disconnect();
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

      const accessory = await prisma.accessory.delete({
        where: {
          id,
          companyId,
        },
      });

      revalidatePath("/accessories");
      return {
        success: true,
        data: parseStringify(accessory),
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
  ): Promise<ActionResponse<Accessory>> => {
    try {
      const validation = assignmentSchema.safeParse(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }

      const result = await prisma.$transaction(async (tx) => {
        // Find the internal user record for audit logging
        const internalUser = await tx.user.findFirst({
          where: { oauthId: user.id, companyId: user.user_metadata?.companyId },
          select: { id: true },
        });

        if (!internalUser) {
          throw new Error("Internal user record not found for audit logging");
        }

        // Get the current stock of the accessory
        const accessory = await tx.accessory.findUnique({
          where: { id: values.itemId },
          select: { totalQuantityCount: true },
        });

        if (!accessory) {
          throw new Error("Accessory not found");
        }

        // Calculate available quantity
        const assignments = await tx.userItem.count({
          where: {
            itemId: values.itemId,
            itemType: ItemType.ACCESSORY,
          },
        });

        const availableQuantity = accessory.totalQuantityCount - assignments;
        const requestedQuantity = 1; // Always 1 for accessory checkout

        if (availableQuantity < requestedQuantity) {
          throw new Error(
            `Not enough quantity available. Requested: ${requestedQuantity}, Available: ${availableQuantity}`,
          );
        }

        await tx.userItem.create({
          data: {
            itemType: ItemType.ACCESSORY,
            userId: values.userId,
            itemId: values.itemId,
            companyId: user.user_metadata?.companyId,
          },
        });

        await tx.accessoryStock.create({
          data: {
            accessoryId: values.itemId,
            quantity: -requestedQuantity,
            type: "assignment",
            companyId: user.user_metadata?.companyId,
            notes: `Assigned ${requestedQuantity} units to user ${values.userId}`,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "ACCESSORY_CHECKOUT",
            entity: "ACCESSORY",
            entityId: values.itemId,
            userId: internalUser.id,
            companyId: user.user_metadata?.companyId,
            details: `Assigned ${requestedQuantity} units to user ${values.userId}`,
          },
        });

        const updatedAccessory = await tx.accessory.findUnique({
          where: { id: values.itemId },
          include: {
            userItems: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        return updatedAccessory;
      });

      return {
        success: true,
        data: parseStringify(result),
      };
    } catch (error) {
      console.error("Error assigning Accessory:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to assign Accessory",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function checkoutAccessory(
  values: z.infer<typeof assignmentSchema>,
): Promise<ActionResponse<Accessory>> {
  const session = getSession();
  return checkout(values);
}

export const checkin = withAuth(
  async (user, userAccessoryId: string): Promise<ActionResponse<Accessory>> => {
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
            const currentAssignment = await tx.userItem.findFirst({
              where: {
                id: userAccessoryId,
                companyId: user.user_metadata?.companyId,
              },
            });

            if (!currentAssignment) {
              throw new Error(
                "No active assignment found for this user and accessory",
              );
            }

            await tx.userItem.delete({
              where: {
                id: currentAssignment.id,
              },
            });

            await tx.accessoryStock.create({
              data: {
                accessoryId: currentAssignment.itemId,
                quantity: 1,
                type: "return",
                companyId: user.user_metadata?.companyId,
                notes: `Returned 1 unit from user ${currentAssignment.userId}`,
              },
            });

            // TODO: Add audit log

            // await tx.auditLog.create({
            //   data: {
            //     action: "ACCESSORY_CHECKIN",
            //     entity: "ACCESSORY",
            //     entityId: currentAssignment.itemId,
            //     companyId: user.user_metadata?.companyId,
            //     details: `Unassigned 1 unit from user ${currentAssignment.userId}`,
            //   },
            // });

            const updatedAccessory = await tx.accessory.findUnique({
              where: { id: currentAssignment.itemId },
              include: {
                userItems: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
                AccessoryStock: {
                  orderBy: {
                    date: "desc",
                  },
                  take: 5,
                },
              },
            });

            return updatedAccessory;
          },
          {
            maxWait: 5000,
            timeout: 10000,
          },
        );

        return {
          success: true,
          data: parseStringify(result),
        };
      } catch (error) {
        console.error(`Attempt ${retries + 1} failed:`, error);

        if (
          !(error instanceof Error) ||
          !error.message.includes("Transaction not found")
        ) {
          throw error;
        }

        retries++;

        if (retries === MAX_RETRIES) {
          console.error("All retries failed");
          throw error;
        }

        await sleep(RETRY_DELAY * retries);
      }
    }

    return {
      success: false,
      error: "Failed to complete check-in after all retries",
    };
  },
);

// Wrapper function for client-side use
export async function checkinAccessory(
  userAccessoryId: string,
): Promise<ActionResponse<Accessory>> {
  const session = getSession();
  return checkin(userAccessoryId);
}
