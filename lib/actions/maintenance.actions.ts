"use server";

import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { handleError, parseStringify } from "@/lib/utils";
import { z } from "zod";
import { analyzeWithLlm } from "./chatGPT.actions";
import { FlowRulesService } from "../services/flowRulesService";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

const flowRulesService = new FlowRulesService();

// Define a type for the maintenance event with its relations
const maintenanceWithDetails =
  Prisma.validator<Prisma.MaintenanceDefaultArgs>()({
    include: {
      asset: { include: { user: true, category: true } },
      statusLabel: true,
      supplier: true,
      co2eRecords: true,
    },
  });
type MaintenanceWithDetails = Prisma.MaintenanceGetPayload<
  typeof maintenanceWithDetails
>;

// Enhanced validation schema for creating a maintenance event
const maintenanceSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  notes: z.string().optional(),
  startDate: z.coerce.date(),
  completionDate: z.coerce.date().optional(),
  isWarranty: z.boolean().default(false),
  cost: z.number().optional(),
  totalCost: z.number().optional(),
  supplierId: z.string().optional(),
});

// Update schema for maintenance completion
const completeMaintenanceSchema = z.object({
  id: z.string(),
  completionDate: z.coerce.date(),
  notes: z.string().optional(),
  cost: z.number().optional(),
  totalCost: z.number().optional(),
});

type MaintenanceInput = z.infer<typeof maintenanceSchema>;
type CompleteMaintenanceInput = z.infer<typeof completeMaintenanceSchema>;

// CREATE: Enhanced maintenance event creation
export const createMaintenanceEvent = withAuth(
  async (
    user,
    data: MaintenanceInput,
  ): Promise<AuthResponse<MaintenanceWithDetails>> => {
    try {
      const validation = maintenanceSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0].message,
          data: {} as MaintenanceWithDetails,
        };
      }

      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceWithDetails,
        };
      }

      // Find the "Scheduled" status label
      const maintenanceStatus = await prisma.statusLabel.findFirst({
        where: {
          name: "Scheduled",
          companyId,
        },
      });

      if (!maintenanceStatus) {
        return {
          success: false,
          error: "Status 'Scheduled' not found. Please create it first.",
          data: {} as MaintenanceWithDetails,
        };
      }

      // Use a transaction to ensure both operations succeed or fail together
      const newEvent = await prisma.$transaction(async (tx) => {
        // 1. Create the maintenance event
        const event = await tx.maintenance.create({
          data: {
            ...validation.data,
            statusLabelId: maintenanceStatus.id,
          },
          include: {
            asset: { include: { user: true, category: true } },
            statusLabel: true,
            supplier: true,
            co2eRecords: true,
          },
        });

        // 2. Update asset's nextMaintenance date if this is scheduled for the future
        if (validation.data.startDate > new Date()) {
          await tx.asset.update({
            where: { id: validation.data.assetId },
            data: { nextMaintenance: validation.data.startDate },
          });
        }

        // 3. Execute flow rules
        const context = {
          maintenance: event,
          user,
          asset: event.asset,
          status: event.statusLabel.name,
          cost: validation.data.cost || 0,
        };

        await flowRulesService.executeRules(companyId, "creation", context);

        return event;
      });

      // 4. Trigger AI carbon footprint analysis (asynchronously)
      if (newEvent.notes) {
        analyzeAndRecordCarbonFootprint(newEvent.id, newEvent.notes);
      }

      revalidatePath("/dashboard");
      revalidatePath("/maintenance");

      return { success: true, data: parseStringify(newEvent) };
    } catch (error) {
      return handleError(error, {} as MaintenanceWithDetails);
    }
  },
);

// READ: Get all maintenance events for company
export const getAllMaintenance = withAuth(
  async (user): Promise<AuthResponse<MaintenanceWithDetails[]>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: [],
        };
      }

      const maintenanceEvents = await prisma.maintenance.findMany({
        where: {
          asset: { companyId },
        },
        include: {
          asset: { include: { user: true, category: true } },
          statusLabel: true,
          supplier: true,
          co2eRecords: true,
        },
        orderBy: { startDate: "desc" },
      });

      return { success: true, data: parseStringify(maintenanceEvents) };
    } catch (error) {
      return handleError(error, []);
    }
  },
);

// READ: Get maintenance events by asset
export const getMaintenanceByAsset = withAuth(
  async (
    user,
    assetId: string,
  ): Promise<AuthResponse<MaintenanceWithDetails[]>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: [],
        };
      }

      const maintenanceEvents = await prisma.maintenance.findMany({
        where: {
          assetId,
          asset: { companyId },
        },
        include: {
          asset: { include: { user: true, category: true } },
          statusLabel: true,
          supplier: true,
          co2eRecords: true,
        },
        orderBy: { startDate: "desc" },
      });

      return { success: true, data: parseStringify(maintenanceEvents) };
    } catch (error) {
      return handleError(error, []);
    }
  },
);

// READ: Get single maintenance event
export const getMaintenanceById = withAuth(
  async (user, id: string): Promise<AuthResponse<MaintenanceWithDetails>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceWithDetails,
        };
      }

      const maintenance = await prisma.maintenance.findFirst({
        where: {
          id,
          asset: { companyId },
        },
        include: {
          asset: { include: { user: true, category: true } },
          statusLabel: true,
          supplier: true,
          co2eRecords: true,
        },
      });

      if (!maintenance) {
        return {
          success: false,
          error: "Maintenance event not found",
          data: {} as MaintenanceWithDetails,
        };
      }

      return { success: true, data: parseStringify(maintenance) };
    } catch (error) {
      return handleError(error, {} as MaintenanceWithDetails);
    }
  },
);

// UPDATE: Complete maintenance event
export const completeMaintenance = withAuth(
  async (
    user,
    data: CompleteMaintenanceInput,
  ): Promise<AuthResponse<MaintenanceWithDetails>> => {
    try {
      const validation = completeMaintenanceSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0].message,
          data: {} as MaintenanceWithDetails,
        };
      }

      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceWithDetails,
        };
      }

      // Find the "Completed" status label
      const completedStatus = await prisma.statusLabel.findFirst({
        where: {
          name: "Completed",
          companyId,
        },
      });

      if (!completedStatus) {
        return {
          success: false,
          error: "Status 'Completed' not found. Please create it first.",
          data: {} as MaintenanceWithDetails,
        };
      }

      const updatedMaintenance = await prisma.$transaction(async (tx) => {
        // Update maintenance event
        const maintenance = await tx.maintenance.update({
          where: { id: validation.data.id },
          data: {
            completionDate: validation.data.completionDate,
            notes: validation.data.notes,
            cost: validation.data.cost,
            totalCost: validation.data.totalCost,
            statusLabelId: completedStatus.id,
          },
          include: {
            asset: { include: { user: true, category: true } },
            statusLabel: true,
            supplier: true,
            co2eRecords: true,
          },
        });

        // Execute completion flow rules
        const context = {
          maintenance,
          user,
          asset: maintenance.asset,
          status: "completed",
          cost: validation.data.cost || 0,
        };

        await flowRulesService.executeRules(companyId, "completion", context);

        return maintenance;
      });

      // Trigger AI analysis for completion notes
      if (validation.data.notes) {
        analyzeAndRecordCarbonFootprint(
          validation.data.id,
          validation.data.notes,
        );
      }

      revalidatePath("/dashboard");
      revalidatePath("/maintenance");

      return { success: true, data: parseStringify(updatedMaintenance) };
    } catch (error) {
      return handleError(error, {} as MaintenanceWithDetails);
    }
  },
);

// UPDATE: Update maintenance status
export const updateMaintenanceStatus = withAuth(
  async (
    user,
    id: string,
    statusName: string,
  ): Promise<AuthResponse<MaintenanceWithDetails>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceWithDetails,
        };
      }

      const statusLabel = await prisma.statusLabel.findFirst({
        where: { name: statusName, companyId },
      });

      if (!statusLabel) {
        return {
          success: false,
          error: `Status '${statusName}' not found`,
          data: {} as MaintenanceWithDetails,
        };
      }

      const updatedMaintenance = await prisma.maintenance.update({
        where: { id },
        data: { statusLabelId: statusLabel.id },
        include: {
          asset: { include: { user: true, category: true } },
          statusLabel: true,
          supplier: true,
          co2eRecords: true,
        },
      });

      revalidatePath("/dashboard");
      revalidatePath("/maintenance");

      return { success: true, data: parseStringify(updatedMaintenance) };
    } catch (error) {
      return handleError(error, {} as MaintenanceWithDetails);
    }
  },
);

// DELETE: Cancel/Delete maintenance event
export const deleteMaintenance = withAuth(
  async (user, id: string): Promise<AuthResponse<{ id: string }>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: { id: "" },
        };
      }

      // Verify maintenance belongs to company
      const maintenance = await prisma.maintenance.findFirst({
        where: {
          id,
          asset: { companyId },
        },
      });

      if (!maintenance) {
        return {
          success: false,
          error: "Maintenance event not found",
          data: { id: "" },
        };
      }

      await prisma.maintenance.delete({
        where: { id },
      });

      revalidatePath("/dashboard");
      revalidatePath("/maintenance");

      return { success: true, data: { id } };
    } catch (error) {
      return handleError(error, { id: "" });
    }
  },
);

/**
 * Analyzes maintenance notes with an LLM to estimate and record the carbon footprint.
 */
// STATS: Get maintenance statistics for dashboard
export const getMaintenanceStats = withAuth(
  async (
    user,
  ): Promise<
    AuthResponse<{
      scheduled: number;
      inProgress: number;
      completed: number;
      overdue: number;
      totalCost: number;
      avgCost: number;
      co2Impact: number;
    }>
  > => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {
            scheduled: 0,
            inProgress: 0,
            completed: 0,
            overdue: 0,
            totalCost: 0,
            avgCost: 0,
            co2Impact: 0,
          },
        };
      }

      // Use parallel queries for better performance
      const [statusCounts, costStats, co2Stats] = await Promise.all([
        // Get status counts
        prisma.maintenance.groupBy({
          by: ["statusLabelId"],
          where: {
            asset: { companyId },
          },
          _count: true,
        }),

        // Get cost statistics
        prisma.maintenance.aggregate({
          where: {
            asset: { companyId },
            isWarranty: false,
          },
          _sum: {
            totalCost: true,
            cost: true,
          },
          _avg: {
            totalCost: true,
            cost: true,
          },
          _count: true,
        }),

        // Get CO2 impact
        prisma.co2eRecord.aggregate({
          where: {
            maintenanceId: { not: null },
            asset: {
              companyId,
            },
          },
          _sum: {
            co2e: true,
          },
        }),
      ]);

      // Get status labels to map counts
      const statusLabels = await prisma.statusLabel.findMany({
        where: { companyId },
        select: { id: true, name: true },
      });

      const statusMap = statusLabels.reduce(
        (acc, label) => {
          acc[label.id] = label.name.toLowerCase();
          return acc;
        },
        {} as Record<string, string>,
      );

      // Calculate status counts
      let scheduled = 0,
        inProgress = 0,
        completed = 0;

      statusCounts.forEach(({ statusLabelId, _count }) => {
        const statusName = statusMap[statusLabelId];
        if (statusName === "scheduled") scheduled = _count;
        else if (statusName === "in progress") inProgress = _count;
        else if (statusName === "completed") completed = _count;
      });

      // Calculate overdue count
      const overdueCount = await prisma.maintenance.count({
        where: {
          asset: { companyId },
          startDate: { lt: new Date() },
          completionDate: null,
          statusLabel: {
            name: { not: "Completed" },
          },
        },
      });

      const totalCost = Number(
        costStats._sum.totalCost || costStats._sum.cost || 0,
      );
      const avgCost = Number(
        costStats._avg.totalCost || costStats._avg.cost || 0,
      );
      const co2Impact = Number(co2Stats._sum.co2e || 0);

      return {
        success: true,
        data: {
          scheduled,
          inProgress,
          completed,
          overdue: overdueCount,
          totalCost,
          avgCost,
          co2Impact,
        },
      };
    } catch (error) {
      return handleError(error, {
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        totalCost: 0,
        avgCost: 0,
        co2Impact: 0,
      });
    }
  },
);

// BATCH OPERATIONS: Update multiple maintenance records
export const batchUpdateMaintenance = withAuth(
  async (
    user,
    updates: Array<{
      id: string;
      statusLabelId?: string;
      completionDate?: Date;
    }>,
  ): Promise<AuthResponse<number>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: 0,
        };
      }

      // Verify all maintenance records belong to the company
      const maintenanceIds = updates.map((u) => u.id);
      const validRecords = await prisma.maintenance.findMany({
        where: {
          id: { in: maintenanceIds },
          asset: { companyId },
        },
        select: { id: true },
      });

      const validIds = new Set(validRecords.map((r) => r.id));
      const validUpdates = updates.filter((u) => validIds.has(u.id));

      if (validUpdates.length === 0) {
        return {
          success: false,
          error: "No valid maintenance records found",
          data: 0,
        };
      }

      // Perform batch updates in transaction
      const results = await prisma.$transaction(
        validUpdates.map((update) =>
          prisma.maintenance.update({
            where: { id: update.id },
            data: {
              ...(update.statusLabelId && {
                statusLabelId: update.statusLabelId,
              }),
              ...(update.completionDate && {
                completionDate: update.completionDate,
              }),
              updatedAt: new Date(),
            },
          }),
        ),
      );

      revalidatePath("/maintenance");
      revalidatePath("/dashboard");

      return { success: true, data: results.length };
    } catch (error) {
      return handleError(error, 0);
    }
  },
);

// PAGINATION: Get maintenance with pagination and filters
export const getMaintenancePaginated = withAuth(
  async (
    user,
    options: {
      page?: number;
      pageSize?: number;
      status?: string[];
      assetId?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
  ): Promise<
    AuthResponse<{
      data: MaintenanceWithDetails[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>
  > => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        };
      }

      const {
        page = 1,
        pageSize = 10,
        status,
        assetId,
        search,
        sortBy = "startDate",
        sortOrder = "desc",
      } = options;

      // Build where clause
      const where: Prisma.MaintenanceWhereInput = {
        asset: { companyId },
        ...(status &&
          status.length > 0 && {
            statusLabel: { name: { in: status } },
          }),
        ...(assetId && { assetId }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { notes: { contains: search, mode: "insensitive" } },
            { asset: { name: { contains: search, mode: "insensitive" } } },
          ],
        }),
      };

      // Build orderBy clause
      const orderBy: Prisma.MaintenanceOrderByWithRelationInput = {};
      if (sortBy === "assetName") {
        orderBy.asset = { name: sortOrder };
      } else if (sortBy === "status") {
        orderBy.statusLabel = { name: sortOrder };
      } else {
        orderBy[sortBy as keyof Prisma.MaintenanceOrderByWithRelationInput] =
          sortOrder;
      }

      // Execute queries in parallel
      const [data, total] = await Promise.all([
        prisma.maintenance.findMany({
          where,
          include: {
            asset: { include: { user: true, category: true } },
            statusLabel: true,
            supplier: true,
            co2eRecords: true,
          },
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.maintenance.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          data: parseStringify(data),
          total,
          page,
          pageSize,
          totalPages,
        },
      };
    } catch (error) {
      return handleError(error, {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });
    }
  },
);

async function analyzeAndRecordCarbonFootprint(
  maintenanceId: string,
  maintenanceNotes: string,
) {
  try {
    const prompt = `Analyze the following maintenance notes and estimate the carbon footprint in kg CO2e. Consider parts, travel, and energy used. Return ONLY a JSON object with "co2e": <number> and "reasoning": "<text>". Notes: "${maintenanceNotes}"`;

    const analysisResult = await analyzeWithLlm(prompt);
    const resultJson = JSON.parse(analysisResult.data || "{}");

    if (resultJson.co2e) {
      const maintenanceEvent = await prisma.maintenance.findUnique({
        where: { id: maintenanceId },
        select: { assetId: true },
      });

      if (maintenanceEvent) {
        await prisma.co2eRecord.create({
          data: {
            co2e: resultJson.co2e,
            co2eType: "Maintenance",
            sourceOrActivity: resultJson.reasoning,
            assetId: maintenanceEvent.assetId,
            maintenanceId: maintenanceId,
            itemType: "Asset",
            scope: 3, // Maintenance is typically Scope 3
            scopeCategory: "Business travel",
            description: "AI-analyzed maintenance carbon footprint",
          },
        });
      }
    }
  } catch (error) {
    console.error("Failed to analyze/record carbon footprint:", error);
  }
}
