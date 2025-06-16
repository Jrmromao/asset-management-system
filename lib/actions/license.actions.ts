"use server";
import { parseStringify } from "@/lib/utils";
import { ItemType, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { assignmentSchema, licenseSchema } from "@/lib/schemas";
import { getAuditLog } from "@/lib/actions/auditLog.actions";

const prisma = new PrismaClient();

export const create = async (
  values: z.infer<typeof licenseSchema>,
): Promise<ActionResponse<License>> => {
  try {
    const validation = licenseSchema.safeParse(values);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    console.log(values);

    return await prisma.$transaction(async (tx) => {
      // Create license
      // const license = await tx.license.create({
      //   // data: {
      //   //   name: values.licenseName,
      //   //   seats: Number(values.seats),
      //   //   minSeatsAlert: Number(values.minSeatsAlert),
      //   //   licensedEmail: values.licensedEmail,
      //   //   renewalDate: values.renewalDate,
      //   //   purchaseDate: values.purchaseDate,
      //   //   alertRenewalDays: Number(values.alertRenewalDays),
      //   //   supplierId: values.supplierId,
      //   //   poNumber: values.poNumber,
      //   //   locationId: values.locationId,
      //   //   departmentId: values.departmentId,
      //   //   inventoryId: values.inventoryId,
      //   //   statusLabelId: values.statusLabelId,
      //   //   purchaseNotes: values.notes,
      //   //   purchasePrice: values.purchasePrice,
      //   //   companyId: session.user.companyId,
      //   // },
      // });

      // Record initial seat allocation
      // await tx.licenseSeat.create({
      //   data: {
      //     licenseId: license.id,
      //     quantity: Number(values.seats),
      //     type: "purchase",
      //     companyId: session.user.companyId,
      //     notes: `Initial purchase of ${values.seats} seats`,
      //   },
      // });

      // Create audit log
      // await tx.auditLog.create({
      //   data: {
      //     action: "LICENSE_CREATED",
      //     entity: "LICENSE",
      //     entityId: license.id,
      //     userId: session.user.id!,
      //     companyId: session.user.companyId,
      //     details: `Created license ${values.licenseName} with ${values.seats} seats`,
      //   },
      // });

      return {
        data: parseStringify({}),
      };
    });
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
};

export const getAll = async (): Promise<ActionResponse<License[]>> => {
  try {
    const licenses = await prisma.license.findMany({
      where: {
        companyId: values.companyId,
      },
      include: {
        company: true,
        statusLabel: true,
        supplier: true,
        department: true,
        departmentLocation: true,
        inventory: true,
        userItems: true,
      },
    });

    return {
      success: true,
      data: parseStringify(licenses),
    };
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return {
      success: false,
      error: "Failed to fetch licenses",
    };
  } finally {
    await prisma.$disconnect();
  }
};

export const findById = async (
  id: string,
): Promise<ActionResponse<License>> => {
  try {
    const licenseQuery = {
      where: { id },
      include: {
        company: true,
        statusLabel: true,
        supplier: true,
        department: true,
        departmentLocation: true,
        inventory: true,
        LicenseSeat: true,
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
      },
    };

    const [license, auditLogsResult] = await Promise.all([
      prisma.license.findUnique(licenseQuery),
      id ? getAuditLog(id) : Promise.resolve({ success: false, data: [] }),
    ]);

    if (!license) {
      return {
        error: "License not found",
      };
    }

    const licenseWithComputedFields = {
      ...license,
      stockHistory: license.LicenseSeat,
      auditLogs: auditLogsResult.success ? auditLogsResult.data : [],
      userLicenses: license.userItems,
      currentAssignments: license.userItems,
    };

    console.log(
      "parseStringify(transformedLicense): ",
      parseStringify(licenseWithComputedFields?.userLicenses),
    );

    return {
      data: parseStringify(licenseWithComputedFields),
    };
  } catch (error) {
    console.error("Error finding license:", error);
    return {
      error: "Failed to find license",
    };
  } finally {
    await prisma.$disconnect();
  }
};

export const update = async (data: License, id: string) => {
  try {
    // const licenseTool = await prisma.license.update({
    //     where: {
    //         id: id
    //     },
    //     ...data
    // });
    return parseStringify("");
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
};
export const remove = async (id: string) => {
  const licenseTool = await prisma.license.delete({
    where: {
      id: id,
    },
  });
  return parseStringify(licenseTool);
};

export async function checkout(
  values: z.infer<typeof assignmentSchema>,
): Promise<ActionResponse<UserItems>> {
  try {
    const validation = await assignmentSchema.safeParseAsync(values);

    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const userLicense = await prisma.$transaction(async (tx) => {
      const license = await tx.license.findUnique({
        where: { id: values.itemId },
        include: { userItems: true },
      });

      if (!license) {
        throw new Error("License not found");
      }

      const usedSeats = license.userItems.reduce(
        (sum, user) => sum + user.quantity,
        0,
      );
      const availableSeats = license.seats - usedSeats;
      const seatsRequested = values.seatsRequested || 1;

      if (availableSeats < seatsRequested) {
        throw new Error(
          `Not enough seats available. Requested: ${seatsRequested}, Available: ${availableSeats}`,
        );
      }

      const assignment = await tx.userItem.create({
        data: {
          itemType: ItemType.LICENSE,
          companyId: values.companyId,
          userId: values.userId,
          licenseId: values.itemId,
          quantity: seatsRequested,
        },
        include: {
          user: true,
          license: true,
        },
      });

      await tx.licenseSeat.create({
        data: {
          licenseId: values.itemId,
          quantity: seatsRequested,
          type: "allocation",
          companyId: values.companyId,
          notes: `Assigned ${seatsRequested} seat(s) to user ${values.userId}`,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "LICENSE_ASSIGNED",
          entity: "LICENSE",
          entityId: values.itemId,
          userId: values.userId,
          companyId: values.companyId,
          details: `Assigned ${seatsRequested} seat(s) of license ${license.name}`,
        },
      });

      return assignment;
    });

    return { data: parseStringify(userLicense) };
  } catch (error) {
    console.error("Error assigning license:", error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}

export async function checkin(
  userLicenseId: string,
): Promise<ActionResponse<License>> {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Get current assignment
        const currentAssignment = await tx.userItem.findFirst({
          where: {
            id: userLicenseId,
          },
          include: {
            license: true,
            user: true,
          },
        });

        if (!currentAssignment) {
          throw new Error(
            "No active assignment found for this user and license",
          );
        }

        // Delete the user license assignment
        await tx.userItem.delete({
          where: {
            id: userLicenseId,
          },
        });

        // Record seat release in LicenseSeat
        await tx.licenseSeat.create({
          data: {
            licenseId: currentAssignment.licenseId!,
            quantity: currentAssignment.quantity,
            type: "release",
            companyId: values.companyId,
            notes: `Released ${currentAssignment.quantity} seat(s) from user ${currentAssignment.userId}`,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            action: "LICENSE_CHECKIN",
            entity: "LICENSE",
            entityId: currentAssignment.licenseId,
            userId: values.userId,
            companyId: values.companyId,
            details: `Released ${currentAssignment.quantity} seat(s) from user ${currentAssignment.user.name}`,
          },
        });

        // Get updated license with current assignments
        const updatedLicense = await tx.license.findUnique({
          where: { id: currentAssignment?.licenseId! },
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
            // licenseSeat: {
            //   orderBy: {
            //     createdAt: "desc",
            //   },
            //   take: 5,
            // },
          },
        });

        if (!updatedLicense) {
          throw new Error("Failed to fetch updated license");
        }

        return updatedLicense;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    return { data: parseStringify(result) };
  } catch (error) {
    console.error("Error checking in license:", error);
    return {
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
