"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents } from "@/lib/utils";
import { auth } from "@/auth";
import { z } from "zod";
import { accessorySchema, assignmentSchema } from "@/lib/schemas";
import { getAuditLog } from "@/lib/actions/auditLog.actions";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/binary";
import { revalidatePath } from "next/cache";
import { ItemType } from "@prisma/client";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const insert = async (
  values: z.infer<typeof accessorySchema>,
): Promise<ActionResponse<Accessory>> => {
  try {
    const validation = accessorySchema.safeParse(values);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    const session = await auth();

    if (!session) {
      return { error: "Not authenticated" };
    }

    return await prisma.$transaction(async (tx) => {
      // Create accessory
      const accessory = await tx.accessory.create({
        data: {
          name: values.name,
          alertEmail: values.alertEmail,
          reorderPoint: Number(values.reorderPoint),
          totalQuantityCount: Number(values.totalQuantityCount),
          purchaseDate: values.purchaseDate,
          notes: values.notes,
          modelNumber: values.modelNumber,
          material: values.material || "",
          endOfLife: values.endOfLife,
          companyId: session.user.companyId,
          statusLabelId: values.statusLabelId,
          supplierId: values.supplierId,
          departmentId: values.departmentId,
          locationId: values.locationId,
          inventoryId: values.inventoryId,
          categoryId: values.categoryId,
          poNumber: values.poNumber,
          weight: values.weight,
          price: values.price,
        },
      });

      // Record initial stock
      await tx.accessoryStock.create({
        data: {
          accessoryId: accessory.id,
          quantity: Number(values.totalQuantityCount),
          type: "purchase",
          companyId: session.user.companyId,
          notes: `Initial stock purchase of ${values.totalQuantityCount} units`,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "ACCESSORY_CREATED",
          entity: "ACCESSORY",
          entityId: accessory.id,
          userId: session.user.id || "",
          companyId: session.user.companyId,
          details: `Created accessory ${values.name} with initial stock of ${values.totalQuantityCount} units`,
        },
      });

      return {
        data: parseStringify(accessory),
      };
    });
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const getAll = async (): Promise<ActionResponse<Accessory[]>> => {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized access" };
    }
    const accessories = await prisma.accessory.findMany({
      include: {
        company: true,
        supplier: true,
        inventory: true,
        statusLabel: true,
      },
      where: {
        companyId: session.user.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { data: parseStringify(accessories) };
  } catch (error) {
    console.error("Error fetching accessories:", error);
    return { error: "Failed to fetch assets" };
  }
};

export const findById = async (
  id: string,
): Promise<ActionResponse<Accessory>> => {
  try {
    // 1. Define the query shape upfront for better type safety and reusability
    const accessoryQuery = {
      where: { id },
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

    // 2. Execute both queries in parallel for better performance
    const [accessory, auditLogsResult] = await Promise.all([
      prisma.accessory.findUnique(accessoryQuery),
      id ? getAuditLog(id) : Promise.resolve({ success: false, data: [] }),
    ]);
    if (!accessory) {
      return { error: "Accessory not found" };
    }

    const accessoryWithComputedFields = {
      ...accessory,
      auditLogs: auditLogsResult.success ? auditLogsResult.data : [],
      userAccessories: accessory.userItems,
      stockHistory: accessory.AccessoryStock,
      currentAssignments: accessory.userItems,
    };

    return {
      data: parseStringify(accessoryWithComputedFields),
    };
  } catch (error) {
    console.error("Error finding accessory:", error);
    // 5. Add more specific error handling
    if (error instanceof PrismaClientKnownRequestError) {
      return {
        error: `Database error: ${error.message}`,
      };
    }
    return {
      error: "Failed to find accessory",
    };
  }
};

export const remove = async (id: string) => {
  try {
    const asset = await prisma.accessory.delete({
      where: {
        id: id,
      },
    });
    return parseStringify(asset);
  } catch (error) {
    console.log(error);
  }
};

export async function processAccessoryCSV(csvContent: string) {
  try {
    const data = processRecordContents(csvContent);
    const session = await auth();

    if (!session?.user?.companyId) {
      throw new Error("User session or company ID is invalid.");
    }

    // const companyId = session.user.companyId;
    const companyId = "bf40528b-ae07-4531-a801-ede53fb31f04";

    const records = await prisma.$transaction(async (tx) => {
      const recordPromises = data.map(async (item) => {
        // Fetch associations
        const [statusLabel, supplier, location, department, inventory] =
          await Promise.all([
            tx.statusLabel.findFirst({ where: { name: item["statusLabel"] } }),
            tx.supplier.findFirst({ where: { name: item["supplier"] } }),
            tx.departmentLocation.findFirst({
              where: { name: item["location"] },
            }),
            tx.department.findFirst({ where: { name: item["department"] } }),
            tx.inventory.findFirst({ where: { name: item["inventory"] } }),
          ]);

        // // Validate required associations
        if (!statusLabel || !supplier) {
          console.warn(
            `Skipping record: Missing required associations for model="${item["model"]}", statusLabel="${item["statusLabel"]}", supplier="${item["supplier"]}"`,
          );
          return null;
        }

        // Create accessory record
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

      // Revalidate the necessary path
      revalidatePath("/accessories");

      // Resolve and filter out null results
      return (await Promise.all(recordPromises)).filter(Boolean);
    });

    // Revalidate the necessary path
    revalidatePath("/assets");

    return {
      success: true,
      message: `Successfully processed ${records.length} records`,
      data: records,
    };
  } catch (error) {
    console.error("Error processing CSV:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process CSV file",
    };
  }
}

export async function checkout(
  values: z.infer<typeof assignmentSchema>,
): Promise<ActionResponse<Accessory>> {
  try {
    try {
      await assignmentSchema.parseAsync(values);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { error: error.errors[0].message };
      }
      return { error: "Validation failed" };
    }

    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    return await prisma.$transaction(async (tx) => {
      // Get current accessory state
      const accessory = await tx.accessory.findUnique({
        where: { id: values.itemId },
        include: {
          userItems: true,
        },
      });

      if (!accessory) {
        throw new Error("Accessory not found");
      }

      // Calculate available quantity
      // Calculate available quantity
      const assignedQuantity = accessory.userItems.reduce(
        (sum, assignment) => sum + assignment.quantity,
        0,
      );
      const availableQuantity = accessory.totalQuantityCount - assignedQuantity;
      // Check if we have enough quantity to assign
      const requestedQuantity = 1; // Default to 1 if not specified
      if (availableQuantity < requestedQuantity) {
        throw new Error(
          `Not enough quantity available. Requested: ${requestedQuantity}, Available: ${availableQuantity}`,
        );
      }

      // Create user accessory assignment
      await tx.userItem.create({
        data: {
          itemType: ItemType.ACCESSORY,
          userId: values.userId,
          accessoryId: values.itemId,
          quantity: requestedQuantity,
          companyId: session.user.companyId,
          notes: "Assigned by user",
        },
      });

      // Record stock movement
      await tx.accessoryStock.create({
        data: {
          accessoryId: values.itemId,
          quantity: -requestedQuantity,
          type: "assignment",
          companyId: session.user.companyId,
          notes: `Assigned ${requestedQuantity} units to user ${values.userId}`,
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: "ACCESSORY_CHECKOUT",
          entity: "ACCESSORY",
          entityId: values.itemId,
          userId: session.user.id || "",
          companyId: session.user.companyId,
          details: `Assigned ${requestedQuantity} units to user ${values.userId}`,
        },
      });

      // Get updated accessory with assignments
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
        data: parseStringify(updatedAccessory),
      };
    });
  } catch (error) {
    console.error("Error assigning Accessory:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to assign Accessory",
    };
  }
}

export async function checkin(
  userAccessoryId: string,
): Promise<ActionResponse<Accessory>> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const session = await auth();
      if (!session) {
        return { error: "Not authenticated" };
      }

      // Start a new prisma client for each attempt
      const result = await prisma.$transaction(
        async (tx) => {
          // Get current assignment
          const currentAssignment = await tx.userItem.findFirst({
            where: {
              id: userAccessoryId,
            },
          });

          if (!currentAssignment) {
            throw new Error(
              "No active assignment found for this user and accessory",
            );
          }

          // Delete the assignment
          await tx.userItem.delete({
            where: {
              id: currentAssignment.id,
            },
          });

          // Record stock return in AccessoryStock
          await tx.accessoryStock.create({
            data: {
              accessoryId: currentAssignment.accessoryId!,
              quantity: currentAssignment.quantity,
              type: "return",
              companyId: session.user.companyId,
              notes: `Returned ${currentAssignment.quantity} units from user ${currentAssignment.userId}`,
            },
          });

          // Create audit log
          await tx.auditLog.create({
            data: {
              action: "ACCESSORY_CHECKIN",
              entity: "ACCESSORY",
              entityId: currentAssignment.accessoryId,
              userId: session.user.id || "",
              companyId: session.user.companyId,
              details: `Unassigned ${currentAssignment.quantity} units from user ${currentAssignment.userId}`,
            },
          });

          // Get updated accessory with current assignments
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
          maxWait: 5000, // 5 seconds max wait
          timeout: 10000, // 10 seconds timeout
        },
      );

      return {
        success: true,
        data: parseStringify(result),
      };
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);

      // If it's not the transaction error, throw immediately
      if (
        !(error instanceof Error) ||
        !error.message.includes("Transaction not found")
      ) {
        throw error;
      }

      retries++;

      // If we've exhausted retries, throw the error
      if (retries === MAX_RETRIES) {
        console.error("All retries failed");
        throw error;
      }

      // Wait before retrying
      await sleep(RETRY_DELAY * retries);
    }
  }

  // This should never be reached due to the throw in the loop
  return {
    error: "Failed to complete check-in after all retries",
  };
}
