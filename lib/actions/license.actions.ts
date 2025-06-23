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
      // Implement license creation logic here, using user.user_metadata?.companyId
      // ...
      return { success: true, data: parseStringify({}) };
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

export const update = withAuth(async (user, data: License, id: string) => {
  try {
    // Implement update logic here, using user.user_metadata?.companyId
    return { success: true, data: parseStringify("") };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to update license" };
  } finally {
    await prisma.$disconnect();
  }
});

export const remove = withAuth(async (user, id: string) => {
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
});

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
