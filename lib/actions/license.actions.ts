"use server";
import { parseStringify } from "@/lib/utils";
import { z } from "zod";
import { assignmentSchema, licenseSchema } from "@/lib/schemas";
import { getAuditLog, createAuditLog } from "@/lib/actions/auditLog.actions";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";

export const create = withAuth(
  async (
    user,
    values: z.infer<typeof licenseSchema>,
  ): Promise<AuthResponse<License>> => {
    try {
      const validation = licenseSchema.safeParse(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }

      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

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

        const license = await tx.license.create({
          data: {
            name: values.licenseName,
            licensedEmail: values.licensedEmail,
            poNumber: values.poNumber || "",
            companyId: companyId,
            statusLabelId: values.statusLabelId,
            supplierId: values.supplierId || null,
            departmentId: values.departmentId,
            locationId: values.locationId,
            inventoryId: values.inventoryId,
            renewalDate: values.renewalDate || new Date(),
            purchaseDate: values.purchaseDate || new Date(),
            purchaseNotes: values.notes || null,
            minSeatsAlert: parseInt(values.minSeatsAlert),
            alertRenewalDays: parseInt(values.alertRenewalDays),
            seats: parseInt(values.seats),

            // Enhanced pricing fields
            purchasePrice: values.purchasePrice
              ? parseFloat(values.purchasePrice)
              : 0,
            renewalPrice: values.renewalPrice
              ? parseFloat(values.renewalPrice)
              : null,
            monthlyPrice: values.monthlyPrice
              ? parseFloat(values.monthlyPrice)
              : null,
            annualPrice: values.annualPrice
              ? parseFloat(values.annualPrice)
              : null,
            pricePerSeat: values.pricePerSeat
              ? parseFloat(values.pricePerSeat)
              : null,
            billingCycle: values.billingCycle || "annual",
            currency: values.currency || "USD",
            discountPercent: values.discountPercent
              ? parseFloat(values.discountPercent)
              : null,
            taxRate: values.taxRate ? parseFloat(values.taxRate) : null,

            // Usage and optimization fields
            lastUsageAudit: values.lastUsageAudit || null,
            utilizationRate: values.utilizationRate
              ? parseFloat(values.utilizationRate)
              : null,
            costCenter: values.costCenter || null,
            budgetCode: values.budgetCode || null,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "LICENSE_CREATED",
            entity: "LICENSE",
            entityId: license.id,
            userId: internalUser.id,
            companyId: companyId,
            details: `Created license ${values.licenseName} with ${values.seats} seats`,
          },
        });

        return license;
      });

      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (user): Promise<AuthResponse<License[]>> => {
    try {
      const licenses = await prisma.license.findMany({
        where: {
          companyId: user.user_metadata?.companyId,
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
      return { success: true, data: parseStringify(licenses) };
    } catch (error) {
      console.error("Error fetching licenses:", error);
      return { success: false, error: "Failed to fetch licenses" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<License>> => {
    try {
      const licenseQuery = {
        where: { id, companyId: user.user_metadata?.companyId },
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
        return { success: false, error: "License not found" };
      }
      const licenseWithComputedFields = {
        ...license,
        stockHistory: license.LicenseSeat,
        auditLogs: auditLogsResult.success ? auditLogsResult.data : [],
        userLicenses: license.userItems,
        currentAssignments: license.userItems,
      };
      return { success: true, data: parseStringify(licenseWithComputedFields) };
    } catch (error) {
      console.error("Error finding license:", error);
      return { success: false, error: "Failed to find license" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const update = withAuth(
  async (user, data: z.infer<typeof licenseSchema>, id: string): Promise<AuthResponse<License>> => {
    try {
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return { success: false, error: "User is not associated with a company" };
      }
      // Update license
      const updatedLicense = await prisma.license.update({
        where: { id, companyId },
        data: {
          name: data.licenseName,
          licensedEmail: data.licensedEmail,
          poNumber: data.poNumber || "",
          statusLabelId: data.statusLabelId,
          supplierId: data.supplierId || null,
          departmentId: data.departmentId,
          locationId: data.locationId,
          inventoryId: data.inventoryId,
          renewalDate: data.renewalDate || new Date(),
          purchaseDate: data.purchaseDate || new Date(),
          purchaseNotes: data.notes || null,
          minSeatsAlert: parseInt(data.minSeatsAlert),
          alertRenewalDays: parseInt(data.alertRenewalDays),
          seats: parseInt(data.seats),
          purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : 0,
          renewalPrice: data.renewalPrice ? parseFloat(data.renewalPrice) : null,
          monthlyPrice: data.monthlyPrice ? parseFloat(data.monthlyPrice) : null,
          annualPrice: data.annualPrice ? parseFloat(data.annualPrice) : null,
          pricePerSeat: data.pricePerSeat ? parseFloat(data.pricePerSeat) : null,
          billingCycle: data.billingCycle || "annual",
          currency: data.currency || "USD",
          discountPercent: data.discountPercent ? parseFloat(data.discountPercent) : null,
          taxRate: data.taxRate ? parseFloat(data.taxRate) : null,
          lastUsageAudit: data.lastUsageAudit || null,
          utilizationRate: data.utilizationRate ? parseFloat(data.utilizationRate) : null,
          costCenter: data.costCenter || null,
          budgetCode: data.budgetCode || null,
        },
      });
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "LICENSE_UPDATED",
        entity: "LICENSE",
        entityId: id,
        details: `License updated: ${updatedLicense.name} (${updatedLicense.seats} seats) by user ${user.id}`,
      });
      return { success: true, data: parseStringify(updatedLicense) };
    } catch (error) {
      console.log(error);
      return { success: false, error: "Failed to update license" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<License>> => {
    try {
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return { success: false, error: "User is not associated with a company" };
      }
      // Get license info before deletion for audit log
      const license = await prisma.license.findUnique({ where: { id, companyId } });
      const deletedLicense = await prisma.license.delete({
        where: {
          id: id,
          companyId,
        },
      });
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "LICENSE_DELETED",
        entity: "LICENSE",
        entityId: id,
        details: license ? `License deleted: ${license.name} (${license.seats} seats) by user ${user.id}` : `License deleted (ID: ${id}) by user ${user.id}`,
      });
      return { success: true, data: parseStringify(deletedLicense) };
    } catch (error) {
      return { success: false, error: "Failed to delete license" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const checkout = withAuth(
  async (
    user,
    values: z.infer<typeof assignmentSchema>,
  ): Promise<AuthResponse<any>> => {
    try {
      // Skip the async validation for now to avoid the baseUrl issue
      const basicValidation = z
        .object({
          userId: z.string().min(1, "User ID is required"),
          licenseId: z.string().min(1, "License ID is required"),
          type: z.enum(["license"]),
          seatsRequested: z.number().optional().default(1),
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

        // Use itemId as licenseId for compatibility
        const licenseId = values.itemId;

        // Get the license to check available seats
        const license = await tx.license.findUnique({
          where: { id: licenseId, companyId },
        });

        if (!license) {
          throw new Error("License not found");
        }

        // Check existing assignments for this license
        const assignedSeats = await tx.userItem.aggregate({
          where: {
            licenseId: licenseId,
            itemType: "LICENSE",
            companyId,
          },
          _sum: { quantity: true },
        });
        const totalAssigned = assignedSeats._sum.quantity || 0;
        const availableSeats = license.seats - totalAssigned;
        const requestedSeats = values.seatsRequested || 1;

        if (requestedSeats > availableSeats) {
          throw new Error(
            `Not enough seats available. Requested: ${requestedSeats}, Available: ${availableSeats}`,
          );
        }

        // Check if user already has this license assigned
        const userAlreadyAssigned = await tx.userItem.findFirst({
          where: {
            userId: values.userId,
            licenseId: licenseId,
            itemType: "LICENSE",
            companyId,
          },
        });

        if (userAlreadyAssigned) {
          throw new Error("License is already assigned to this user");
        }

        // Create the assignment with quantity
        const userItem = await tx.userItem.create({
          data: {
            userId: values.userId,
            licenseId: licenseId,
            itemType: "LICENSE",
            quantity: requestedSeats,
            companyId: companyId,
          },
        });

        return { license, internalUserId: internalUser.id, assigneeUser };
      });

      await createAuditLog({
        companyId: companyId,
        action: "LICENSE_ASSIGNED",
        entity: "LICENSE",
        entityId: result.license.id,
        details: `License ${result.license.name} assigned to user ${result.assigneeUser.name || result.assigneeUser.email} by internal user ID ${result.internalUserId}`,
      });

      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error("Error assigning license:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const checkin = withAuth(
  async (user, userLicenseId: string): Promise<AuthResponse<License>> => {
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
          where: { id: userLicenseId },
          include: {
            user: { select: { name: true, email: true } },
          },
        });

        if (!userItem || userItem.companyId !== companyId) {
          throw new Error("Assignment not found or not authorized");
        }

        await tx.userItem.delete({
          where: { id: userLicenseId },
        });

        // Get the updated license
        const license = await tx.license.findUnique({
          where: { id: userItem.licenseId || "" },
          include: {
            company: true,
            statusLabel: true,
            supplier: true,
            department: true,
            departmentLocation: true,
            inventory: true,
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
        });

        if (!license) {
          throw new Error("License not found");
        }

        return { license, internalUserId: internalUser.id, userItem };
      });

      await createAuditLog({
        companyId: companyId,
        action: "LICENSE_CHECKIN",
        entity: "LICENSE",
        entityId: result.license.id,
        details: `License ${result.license.name} checked in from user ${result.userItem.user?.name || result.userItem.user?.email} by internal user ID ${result.internalUserId}`,
      });

      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error("Error checking in license:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const exportLicensesToCSV = withAuth(
  async (
    user,
  ): Promise<{ success: boolean; data?: string; error?: string }> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const licenses = await prisma.license.findMany({
        where: { companyId },
        include: {
          statusLabel: true,
          supplier: true,
          department: true,
          departmentLocation: true,
          inventory: true,
          userItems: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // CSV export with comprehensive license data
      const csvHeaders =
        "Name,Licensed Email,Seats,Status,Department,Location,Supplier,Purchase Price,Renewal Price,Currency,Renewal Date,Assigned Users\n";
      const csvRows = licenses
        .map((license) => {
          const assignedUsers = license.userItems
            .map((item) => item.user?.name || item.user?.email)
            .filter(Boolean)
            .join("; ");

          return `"${license.name}","${license.licensedEmail || ""}","${license.seats || 0}","${license.statusLabel?.name || ""}","${license.department?.name || ""}","${license.departmentLocation?.name || ""}","${license.supplier?.name || ""}","${license.purchasePrice || 0}","${license.renewalPrice || ""}","${license.currency || "USD"}","${license.renewalDate ? new Date(license.renewalDate).toLocaleDateString() : ""}","${assignedUsers}"`;
        })
        .join("\n");

      await createAuditLog({
        companyId,
        action: "LICENSES_EXPORTED_CSV",
        entity: "LICENSE",
        details: `All licenses exported to CSV by user ${user.id}`,
      });

      return {
        success: true,
        data: csvHeaders + csvRows,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
