"use server";
import { parseStringify } from "@/lib/utils";
import { z } from "zod";
import { assignmentSchema, licenseSchema } from "@/lib/schemas";
import { getAuditLog } from "@/lib/actions/auditLog.actions";
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
            purchasePrice: values.purchasePrice ? parseFloat(values.purchasePrice) : 0,
            renewalPrice: values.renewalPrice ? parseFloat(values.renewalPrice) : null,
            monthlyPrice: values.monthlyPrice ? parseFloat(values.monthlyPrice) : null,
            annualPrice: values.annualPrice ? parseFloat(values.annualPrice) : null,
            pricePerSeat: values.pricePerSeat ? parseFloat(values.pricePerSeat) : null,
            billingCycle: values.billingCycle || "annual",
            currency: values.currency || "USD",
            discountPercent: values.discountPercent ? parseFloat(values.discountPercent) : null,
            taxRate: values.taxRate ? parseFloat(values.taxRate) : null,
            
            // Usage and optimization fields
            lastUsageAudit: values.lastUsageAudit || null,
            utilizationRate: values.utilizationRate ? parseFloat(values.utilizationRate) : null,
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
  async (user, data: License, id: string): Promise<AuthResponse<License>> => {
    try {
      // Implement update logic here, using user.user_metadata?.companyId
      return { success: true, data: parseStringify({}) };
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
      const licenseTool = await prisma.license.delete({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
      });
      return { success: true, data: parseStringify(licenseTool) };
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
  ): Promise<AuthResponse<UserItems>> => {
    try {
      const validation = await assignmentSchema.safeParseAsync(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }
      // Implement checkout logic here, using user.user_metadata?.companyId
      return { success: true, data: parseStringify({}) };
    } catch (error) {
      console.error("Error assigning license:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
);

export const checkin = withAuth(
  async (user, userLicenseId: string): Promise<AuthResponse<License>> => {
    try {
      // Implement checkin logic here, using user.user_metadata?.companyId
      return { success: true, data: parseStringify({}) };
    } catch (error) {
      console.error("Error checking in license:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
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
      const csvHeaders = "Name,Licensed Email,Seats,Status,Department,Location,Supplier,Purchase Price,Renewal Price,Currency,Renewal Date,Assigned Users\n";
      const csvRows = licenses
        .map((license) => {
          const assignedUsers = license.userItems
            .map(item => item.user?.name || item.user?.email)
            .filter(Boolean)
            .join('; ');
          
          return `"${license.name}","${license.licensedEmail || ""}","${license.seats || 0}","${license.statusLabel?.name || ""}","${license.department?.name || ""}","${license.departmentLocation?.name || ""}","${license.supplier?.name || ""}","${license.purchasePrice || 0}","${license.renewalPrice || ""}","${license.currency || "USD"}","${license.renewalDate ? new Date(license.renewalDate).toLocaleDateString() : ""}","${assignedUsers}"`;
        })
        .join("\n");

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
