"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents } from "@/lib/utils";
import { z } from "zod";
import { accessorySchema, assignmentSchema } from "@/lib/schemas";
import { getAuditLog } from "@/lib/actions/auditLog.actions";
import { revalidatePath } from "next/cache";
import { ItemType, Prisma } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof accessorySchema>,
  ): Promise<ActionResponse<Accessory>> => {
    try {
      const validation = accessorySchema.safeParse(values);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      return await prisma.$transaction(async (tx) => {
        const accessory = await tx.accessory.create({
          data: {
            name: values.name,
            alertEmail: values.alertEmail,
            serialNumber: values.serialNumber,
            reorderPoint: Number(values.reorderPoint),
            totalQuantityCount: Number(values.totalQuantityCount),
            modelNumber: values.modelNumber,
            companyId: user.user_metadata?.companyId,
            statusLabelId: values.statusLabelId,
            departmentId: values.departmentId,
            locationId: values.locationId,
            inventoryId: values.inventoryId,
            categoryId: values.categoryId,
          },
        });

        await tx.accessoryStock.create({
          data: {
            accessoryId: accessory.id,
            quantity: Number(values.totalQuantityCount),
            type: "purchase",
            companyId: user.user_metadata?.companyId,
            notes: `Initial stock purchase of ${values.totalQuantityCount} units`,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "ACCESSORY_CREATED",
            entity: "ACCESSORY",
            entityId: accessory.id,
            userId: user.id,
            companyId: user.user_metadata?.companyId,
            details: `Created accessory ${values.name} with initial stock of ${values.totalQuantityCount} units`,
          },
        });

        return {
          success: true,
          data: parseStringify(accessory),
        };
      });
    } catch (error) {
      console.error(error);
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (user): Promise<ActionResponse<Accessory[]>> => {
    try {
      const accessories = await prisma.accessory.findMany({
        include: {
          company: true,
          supplier: true,
          inventory: true,
          statusLabel: true,
        },
        where: {
          companyId: user.user_metadata?.companyId,
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
      return { error: "Failed to fetch accessories" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<Accessory>> => {
    try {
      const accessoryQuery = {
        where: {
          id,
          companyId: user.user_metadata?.companyId,
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
        return { error: "Accessory not found" };
      }

      return {
        success: true,
        data: parseStringify({
          ...accessory,
          auditLogs: auditLogsResult.success ? auditLogsResult.data : [],
          userAccessories: accessory.userItems,
          stockHistory: accessory.AccessoryStock,
          currentAssignments: accessory.userItems,
        }),
      };
    } catch (error) {
      console.error("Error finding accessory:", error);
      return { error: "Failed to find accessory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Accessory>> => {
    try {
      const asset = await prisma.accessory.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "ACCESSORY_DELETED",
          entity: "ACCESSORY",
          entityId: id,
          userId: user.id,
          companyId: user.user_metadata?.companyId,
          details: `Deleted accessory with ID ${id}`,
        },
      });

      return {
        success: true,
        data: parseStringify(asset),
      };
    } catch (error) {
      console.error("Error deleting accessory:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return { error: "Accessory not found" };
        }
        if (error.code === "P2003") {
          return {
            error: "Cannot delete accessory because it is still in use",
          };
        }
      }

      return { error: "Failed to delete accessory" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

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
        error:
          error instanceof Error ? error.message : "Failed to process CSV file",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const checkout = withAuth(
  async (
    user,
    values: z.infer<typeof assignmentSchema>,
  ): Promise<ActionResponse<Accessory>> => {
    try {
      const validation = assignmentSchema.safeParse(values);
      if (!validation.success) {
        return { error: validation.error.errors[0].message };
      }

      return await prisma.$transaction(async (tx) => {
        const accessory = await tx.accessory.findUnique({
          where: { id: values.itemId },
          include: {
            userItems: true,
          },
        });

        if (!accessory) {
          throw new Error("Accessory not found");
        }

        const assignedQuantity = accessory.userItems.reduce(
          (sum, assignment) => sum + assignment.quantity,
          0,
        );
        const availableQuantity =
          accessory.totalQuantityCount - assignedQuantity;
        const requestedQuantity = 1;

        if (availableQuantity < requestedQuantity) {
          throw new Error(
            `Not enough quantity available. Requested: ${requestedQuantity}, Available: ${availableQuantity}`,
          );
        }

        await tx.userItem.create({
          data: {
            itemType: ItemType.ACCESSORY,
            userId: values.userId,
            accessoryId: values.itemId,
            quantity: requestedQuantity,
            companyId: user.user_metadata?.companyId,
            notes: "Assigned by user",
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
            userId: user.id,
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

        return {
          success: true,
          data: parseStringify(updatedAccessory),
        };
      });
    } catch (error) {
      console.error("Error assigning Accessory:", error);
      return {
        error:
          error instanceof Error ? error.message : "Failed to assign Accessory",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

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
                accessoryId: currentAssignment.accessoryId!,
                quantity: currentAssignment.quantity,
                type: "return",
                companyId: user.user_metadata?.companyId,
                notes: `Returned ${currentAssignment.quantity} units from user ${currentAssignment.userId}`,
              },
            });

            await tx.auditLog.create({
              data: {
                action: "ACCESSORY_CHECKIN",
                entity: "ACCESSORY",
                entityId: currentAssignment.accessoryId,
                userId: user.id,
                companyId: user.user_metadata?.companyId,
                details: `Unassigned ${currentAssignment.quantity} units from user ${currentAssignment.userId}`,
              },
            });

            const updatedAccessory = await tx.accessory.findUnique({
              where: { id: currentAssignment.accessoryId! },
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
      error: "Failed to complete check-in after all retries",
    };
  },
);
