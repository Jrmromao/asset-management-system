"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { z } from "zod";
import { headers } from "next/headers";
import { withAuth } from "@/lib/middleware/withAuth";

// Validation schema for AuditLog
const auditLogSchema = z.object({
  action: z.string().min(1, "Action is required"),
  entity: z.string().min(1, "Entity is required"),
  entityId: z.string().optional(),
  details: z.string().optional(),
  companyId: z.string().min(1, "Company ID is required"),
  licenseId: z.string().optional(),
  accessoryId: z.string().optional(),
  dataAccessed: z.any().optional(),
});

type AuditLogInput = z.infer<typeof auditLogSchema>;

export const createAuditLog = withAuth(async (user, data: AuditLogInput) => {
  try {
    const validatedData = auditLogSchema.parse(data);
    const ipAddress = user.ipAddress;
    const companyId = user.privateMetadata?.companyId as string;

    if (!companyId) {
      return { success: false, error: "User is not associated with a company" };
    }

    // Find the internal user record for audit logging
    const internalUser = await prisma.user.findFirst({
      where: { oauthId: user.id, companyId },
      select: { id: true },
    });

    if (!internalUser) {
      return {
        success: false,
        error: "Internal user record not found for audit logging",
      };
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        ...validatedData,
        userId: internalUser.id,
        ipAddress,
        companyId,
      },
    });

    revalidatePath("/audit-logs");
    return {
      success: true,
      data: auditLog,
    };
  } catch (error) {
    console.error("Error creating audit log:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Failed to create audit log" };
  } finally {
    await prisma.$disconnect();
  }
});

export const getAuditLog = withAuth(async (user, entityId: string) => {
  try {
    const auditLog = await prisma.auditLog.findMany({
      where: {
        entityId,
        companyId: user.user_metadata?.companyId,
      },
    });

    if (!auditLog) {
      return { success: false, error: "Audit log not found" };
    }

    await createAuditLog({
      companyId: user.user_metadata?.companyId,
      action: "AUDIT_LOG_VIEWED",
      entity: "AUDIT_LOG",
      entityId,
      details: `Audit log viewed by user ${user.id} for entityId ${entityId}`,
    });

    return {
      success: true,
      data: auditLog,
    };
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return { success: false, error: "Failed to fetch audit log" };
  } finally {
    await prisma.$disconnect();
  }
});

export const getAuditLogs = withAuth(
  async (
    user,
    page = 1,
    limit = 10,
    filters?: {
      action?: string;
      entity?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) => {
    try {
      const where = {
        companyId: user.user_metadata?.companyId,
        ...(filters?.action && { action: filters.action }),
        ...(filters?.entity && { entity: filters.entity }),
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      };

      const total = await prisma.auditLog.count({ where });

      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "AUDIT_LOG_VIEWED",
        entity: "AUDIT_LOG",
        details: `Audit logs viewed by user ${user.id} with filters: ${JSON.stringify(filters)}`,
      });

      return {
        success: true,
        data: auditLogs,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
        },
      };
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      return { success: false, error: "Failed to fetch audit logs" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const updateAuditLog = withAuth(
  async (user, id: string, data: Partial<AuditLogInput>) => {
    try {
      const existingLog = await prisma.auditLog.findUnique({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });

      if (!existingLog) {
        return { success: false, error: "Audit log not found" };
      }

      const validatedData = auditLogSchema.partial().parse(data);

      const updatedLog = await prisma.auditLog.update({
        where: { id },
        data: validatedData,
      });

      revalidatePath("/audit-logs");
      return {
        success: true,
        data: updatedLog,
      };
    } catch (error) {
      console.error("Error updating audit log:", error);
      if (error instanceof z.ZodError) {
        return { success: false, error: error.errors[0].message };
      }
      return { success: false, error: "Failed to update audit log" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const deleteAuditLog = withAuth(async (user, id: string) => {
  try {
    const existingLog = await prisma.auditLog.findUnique({
      where: {
        id,
        companyId: user.user_metadata?.companyId,
      },
    });

    if (!existingLog) {
      return { success: false, error: "Audit log not found" };
    }

    await prisma.auditLog.delete({
      where: { id },
    });

    revalidatePath("/audit-logs");
    return { success: true };
  } catch (error) {
    console.error("Error deleting audit log:", error);
    return { success: false, error: "Failed to delete audit log" };
  } finally {
    await prisma.$disconnect();
  }
});

export const exportAuditLogs = withAuth(
  async (
    user,
    filters?: {
      action?: string;
      entity?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) => {
    try {
      const where = {
        companyId: user.user_metadata?.companyId,
        ...(filters?.action && { action: filters.action }),
        ...(filters?.entity && { entity: filters.entity }),
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: filters.startDate,
              lte: filters.endDate,
            },
          }),
      };

      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const csvData = auditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId || "",
        details: log.details || "",
        userName: log.user.name,
        userEmail: log.user.email,
        createdAt: log.createdAt.toISOString(),
        ipAddress: log.ipAddress || "",
      }));

      return {
        success: true,
        data: csvData,
      };
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      return { success: false, error: "Failed to export audit logs" };
    } finally {
      await prisma.$disconnect();
    }
  },
);
