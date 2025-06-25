"use server";

import { prisma as db } from "@/app/db";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";

export interface MaintenanceFlow {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  isActive: boolean;
  priority: number;
  executionCount: number;
  successRate: number;
  lastExecuted?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateMaintenanceFlowParams {
  name: string;
  description?: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  priority?: number;
  isActive?: boolean;
}

export interface UpdateMaintenanceFlowParams {
  name?: string;
  description?: string;
  trigger?: string;
  conditions?: any[];
  actions?: any[];
  priority?: number;
  isActive?: boolean;
}

export interface MaintenanceFlowStats {
  totalFlows: number;
  activeFlows: number;
  inactiveFlows: number;
  totalExecutions: number;
  averageSuccessRate: number;
  recentExecutions: number;
  flowsByPriority: Array<{
    priority: string;
    count: number;
  }>;
}

export async function getMaintenanceFlows(
  filters: Record<string, any> = {},
): Promise<MaintenanceFlow[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { oauthId: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      throw new Error("User company not found");
    }

    // Build where clause based on filters
    const whereClause: any = {
      companyId: user.companyId,
    };

    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    if (filters.priority) {
      whereClause.priority = filters.priority;
    }

    if (filters.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const flows = await db.flowRule.findMany({
      where: whereClause,
      include: {
        conditions: true,
        actions: true,
        executions: {
          select: {
            id: true,
            success: true,
            executedAt: true,
          },
          orderBy: { executedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return flows.map((flow: any) => ({
      id: flow.id,
      name: flow.name,
      description: flow.description,
      trigger: flow.trigger,
      conditions: flow.conditions,
      actions: flow.actions,
      isActive: flow.isActive,
      priority: flow.priority,
      executionCount: flow.executions.length,
      successRate:
        flow.executions.length > 0
          ? (flow.executions.filter((e: any) => e.success === true).length /
              flow.executions.length) *
            100
          : 0,
      lastExecuted: flow.executions[0]?.executedAt,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      createdBy: user.id,
    }));
  } catch (error) {
    console.error("Error fetching maintenance flows:", error);
    throw new Error("Failed to fetch maintenance flows");
  }
}

export async function createMaintenanceFlow(
  data: CreateMaintenanceFlowParams,
): Promise<MaintenanceFlow> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { oauthId: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      throw new Error("User company not found");
    }

    const flow = await db.flowRule.create({
      data: {
        name: data.name,
        description: data.description || "",
        trigger: data.trigger,
        priority: data.priority || 100,
        isActive: data.isActive ?? true,
        companyId: user.companyId,
        conditions: {
          create: data.conditions.map((condition, index) => ({
            field: condition.field,
            operator: condition.operator,
            value: JSON.stringify(condition.value),
            logicalOperator: condition.logicalOperator || "AND",
            order: index,
          })),
        },
        actions: {
          create: data.actions.map((action, index) => ({
            type: action.type,
            parameters: action.parameters || {},
            order: index,
          })),
        },
      },
      include: {
        conditions: true,
        actions: true,
      },
    });

    revalidatePath("/maintenance-flows");

    return {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      trigger: flow.trigger,
      conditions: flow.conditions,
      actions: flow.actions,
      isActive: flow.isActive,
      priority: flow.priority,
      executionCount: 0,
      successRate: 0,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      createdBy: user.id,
    };
  } catch (error) {
    console.error("Error creating maintenance flow:", error);
    throw new Error("Failed to create maintenance flow");
  }
}

export async function updateMaintenanceFlow(
  id: string,
  data: UpdateMaintenanceFlowParams,
): Promise<MaintenanceFlow> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { oauthId: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      throw new Error("User company not found");
    }

    // Verify flow ownership
    const existingFlow = await db.flowRule.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!existingFlow) {
      throw new Error("Flow not found or access denied");
    }

    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    // Handle conditions update
    if (data.conditions) {
      await db.flowCondition.deleteMany({
        where: { flowRuleId: id },
      });
      updateData.conditions = {
        create: data.conditions.map((condition, index) => ({
          field: condition.field,
          operator: condition.operator,
          value: JSON.stringify(condition.value),
          logicalOperator: condition.logicalOperator || "AND",
          order: index,
        })),
      };
    }

    // Handle actions update
    if (data.actions) {
      await db.flowAction.deleteMany({
        where: { flowRuleId: id },
      });
      updateData.actions = {
        create: data.actions.map((action, index) => ({
          type: action.type,
          parameters: action.parameters || {},
          order: index,
        })),
      };
    }

    const flow = await db.flowRule.update({
      where: { id },
      data: updateData,
      include: {
        conditions: true,
        actions: true,
        executions: {
          select: {
            id: true,
            success: true,
            executedAt: true,
          },
          orderBy: { executedAt: "desc" },
          take: 5,
        },
      },
    });

    revalidatePath("/maintenance-flows");

    return {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      trigger: flow.trigger,
      conditions: flow.conditions,
      actions: flow.actions,
      isActive: flow.isActive,
      priority: flow.priority,
      executionCount: flow.executions.length,
      successRate:
        flow.executions.length > 0
          ? (flow.executions.filter((e: any) => e.success === true).length /
              flow.executions.length) *
            100
          : 0,
      lastExecuted: flow.executions[0]?.executedAt,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      createdBy: user.id,
    };
  } catch (error) {
    console.error("Error updating maintenance flow:", error);
    throw new Error("Failed to update maintenance flow");
  }
}

export async function deleteMaintenanceFlow(id: string): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { oauthId: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      throw new Error("User company not found");
    }

    // Verify flow ownership
    const existingFlow = await db.flowRule.findFirst({
      where: {
        id,
        companyId: user.companyId,
      },
    });

    if (!existingFlow) {
      throw new Error("Flow not found or access denied");
    }

    // Delete related records first
    await db.flowExecution.deleteMany({
      where: { flowRuleId: id },
    });

    await db.flowCondition.deleteMany({
      where: { flowRuleId: id },
    });

    await db.flowAction.deleteMany({
      where: { flowRuleId: id },
    });

    await db.flowRule.delete({
      where: { id },
    });

    revalidatePath("/maintenance-flows");
  } catch (error) {
    console.error("Error deleting maintenance flow:", error);
    throw new Error("Failed to delete maintenance flow");
  }
}

export async function getMaintenanceFlowStats(): Promise<MaintenanceFlowStats> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { oauthId: userId },
      select: { id: true, companyId: true },
    });

    if (!user) {
      console.error("❌ User not found in database for userId:", userId);
      throw new Error("User not found in database");
    }

    if (!user.companyId) {
      console.error("❌ User has no companyId:", { userId, dbUserId: user.id });

      // Try to sync user metadata and get company ID
      try {
        console.log("🔄 Attempting to sync user metadata...");
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(userId);

        // Check if company ID exists in Clerk metadata
        const companyIdFromClerk = clerkUser.privateMetadata
          ?.companyId as string;

        if (companyIdFromClerk) {
          console.log(
            "✅ Found company ID in Clerk metadata, updating database...",
          );

          // Update the user's company ID in the database
          const updatedUser = await db.user.update({
            where: { id: user.id },
            data: { companyId: companyIdFromClerk },
            select: { companyId: true },
          });

          console.log("✅ Updated user company ID:", updatedUser.companyId);

          // Continue with the updated company ID
          user.companyId = updatedUser.companyId;
        } else {
          // No company ID in Clerk metadata either
          console.error("❌ No company ID found in Clerk metadata either");
          throw new Error(
            "User company not found. Please complete company registration or contact support.",
          );
        }
      } catch (syncError) {
        console.error("❌ Failed to sync user metadata:", syncError);
        throw new Error(
          "User company not found and metadata sync failed. Please contact support.",
        );
      }
    }

    const [flows, executions] = await Promise.all([
      db.flowRule.findMany({
        where: { companyId: user.companyId },
        select: {
          id: true,
          isActive: true,
          priority: true,
        },
      }),
      db.flowExecution.findMany({
        where: {
          flowRule: {
            companyId: user.companyId,
          },
          executedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          id: true,
          success: true,
          executedAt: true,
        },
      }),
    ]);

    const totalFlows = flows.length;
    const activeFlows = flows.filter((f: any) => f.isActive).length;
    const inactiveFlows = totalFlows - activeFlows;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(
      (e: any) => e.success === true,
    ).length;
    const averageSuccessRate =
      totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    // Recent executions (last 7 days)
    const recentExecutions = executions.filter(
      (e: any) =>
        e.executedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length;

    // Group by priority
    const flowsByPriority = flows.reduce(
      (acc: Array<{ priority: string; count: number }>, flow: any) => {
        const priorityLevel =
          flow.priority > 300 ? "HIGH" : flow.priority > 200 ? "MEDIUM" : "LOW";
        const existing = acc.find((item) => item.priority === priorityLevel);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ priority: priorityLevel, count: 1 });
        }
        return acc;
      },
      [],
    );

    return {
      totalFlows,
      activeFlows,
      inactiveFlows,
      totalExecutions,
      averageSuccessRate: Math.round(averageSuccessRate),
      recentExecutions,
      flowsByPriority,
    };
  } catch (error) {
    console.error("Error fetching maintenance flow stats:", error);
    throw new Error("Failed to fetch maintenance flow stats");
  }
}
