"use server";

import { db } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: string;
  isActive?: boolean;
}

export interface UpdateMaintenanceFlowParams {
  name?: string;
  description?: string;
  trigger?: string;
  conditions?: any[];
  actions?: any[];
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category?: string;
  isActive?: boolean;
}

export interface MaintenanceFlowStats {
  totalFlows: number;
  activeFlows: number;
  inactiveFlows: number;
  totalExecutions: number;
  averageSuccessRate: number;
  recentExecutions: number;
  flowsByCategory: Array<{
    category: string;
    count: number;
  }>;
  flowsByPriority: Array<{
    priority: string;
    count: number;
  }>;
}

export async function getMaintenanceFlows(filters: Record<string, any> = {}): Promise<MaintenanceFlow[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { authId: userId },
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

    if (filters.category) {
      whereClause.category = filters.category;
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
            status: true,
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
      priority: flow.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      category: flow.category,
      executionCount: flow.executions.length,
      successRate: flow.executions.length > 0 
        ? (flow.executions.filter((e: any) => e.status === "SUCCESS").length / flow.executions.length) * 100
        : 0,
      lastExecuted: flow.executions[0]?.executedAt,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      createdBy: flow.createdBy,
    }));
  } catch (error) {
    console.error("Error fetching maintenance flows:", error);
    throw new Error("Failed to fetch maintenance flows");
  }
}

export async function createMaintenanceFlow(data: CreateMaintenanceFlowParams): Promise<MaintenanceFlow> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { authId: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      throw new Error("User company not found");
    }

    const flow = await db.flowRule.create({
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        priority: data.priority || "MEDIUM",
        category: data.category,
        isActive: data.isActive ?? true,
        companyId: user.companyId,
        createdBy: user.id,
        conditions: {
          create: data.conditions.map((condition, index) => ({
            type: condition.type,
            field: condition.field,
            operator: condition.operator,
            value: JSON.stringify(condition.value),
            order: index,
          })),
        },
        actions: {
          create: data.actions.map((action, index) => ({
            type: action.type,
            config: JSON.stringify(action.config),
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
      priority: flow.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      category: flow.category,
      executionCount: 0,
      successRate: 0,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      createdBy: flow.createdBy,
    };
  } catch (error) {
    console.error("Error creating maintenance flow:", error);
    throw new Error("Failed to create maintenance flow");
  }
}

export async function updateMaintenanceFlow(
  id: string,
  data: UpdateMaintenanceFlowParams
): Promise<MaintenanceFlow> {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: { authId: userId },
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
          type: condition.type,
          field: condition.field,
          operator: condition.operator,
          value: JSON.stringify(condition.value),
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
          config: JSON.stringify(action.config),
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
            status: true,
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
      priority: flow.priority as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      category: flow.category,
      executionCount: flow.executions.length,
      successRate: flow.executions.length > 0 
        ? (flow.executions.filter(e => e.status === "SUCCESS").length / flow.executions.length) * 100
        : 0,
      lastExecuted: flow.executions[0]?.executedAt,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
      createdBy: flow.createdBy,
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
      where: { authId: userId },
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
      where: { authId: userId },
      select: { id: true, companyId: true },
    });

    if (!user?.companyId) {
      throw new Error("User company not found");
    }

    const [flows, executions] = await Promise.all([
      db.flowRule.findMany({
        where: { companyId: user.companyId },
        select: {
          id: true,
          isActive: true,
          category: true,
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
          status: true,
          executedAt: true,
        },
      }),
    ]);

    const totalFlows = flows.length;
    const activeFlows = flows.filter(f => f.isActive).length;
    const inactiveFlows = totalFlows - activeFlows;
    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === "SUCCESS").length;
    const averageSuccessRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    // Recent executions (last 7 days)
    const recentExecutions = executions.filter(
      e => e.executedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Group by category
    const flowsByCategory = flows.reduce((acc, flow) => {
      const existing = acc.find(item => item.category === flow.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ category: flow.category, count: 1 });
      }
      return acc;
    }, [] as Array<{ category: string; count: number }>);

    // Group by priority
    const flowsByPriority = flows.reduce((acc, flow) => {
      const existing = acc.find(item => item.priority === flow.priority);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ priority: flow.priority, count: 1 });
      }
      return acc;
    }, [] as Array<{ priority: string; count: number }>);

    return {
      totalFlows,
      activeFlows,
      inactiveFlows,
      totalExecutions,
      averageSuccessRate: Math.round(averageSuccessRate),
      recentExecutions,
      flowsByCategory,
      flowsByPriority,
    };
  } catch (error) {
    console.error("Error fetching maintenance flow stats:", error);
    throw new Error("Failed to fetch maintenance flow stats");
  }
} 