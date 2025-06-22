"use server";

import { prisma } from "@/app/db";
import { Prisma } from "@prisma/client";
import { assetSchema } from "@/lib/schemas";
import { AssetResponse } from "@/types/asset";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { checkAssetLimit } from "@/lib/services/usage.service";
import { calculateAssetCo2, createCo2eRecord } from "@/lib/services/ai.service";

type CSVResponse = {
  success: boolean;
  message: string;
};

type TemplateResponse = {
  success: boolean;
  data: string;
  error?: string;
};

// Add new types for the utilization stats response
export type AssetUtilizationStatsData = {
  totalAssets: number;
  assignedAssets: number;
  unassignedAssets: number;
  utilizationRate: number;
  assetsByStatus: (Prisma.PickEnumerable<
    Prisma.AssetGroupByOutputType,
    "statusLabelId"[]
  > & {
    _count: {
      id: number;
    };
  })[];
  assetsByCategory: (Prisma.PickEnumerable<
    Prisma.AssetGroupByOutputType,
    "categoryId"[]
  > & {
    _count: {
      id: number;
    };
  })[];
  recentAssets: number;
};

export type AssetUtilizationStatsResponse = {
  success: boolean;
  data?: AssetUtilizationStatsData;
  error?: string;
};

export type CreateAssetInput = {
  name: string;
  serialNumber: string;
  modelId: string;
  statusLabelId: string;
  departmentId: string;
  inventoryId: string;
  locationId: string;
  formTemplateId: string;
  templateValues?: Record<string, any>;
  purchaseOrderId?: string;
};

// Helper function to convert single item to array
const toArray = <T>(item: T | null): T[] => (item ? [item] : []);

export async function createAsset(
  data: CreateAssetInput,
): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return {
        success: false,
        data: [],
        error: "Unauthorized: No active organization found.",
      };
    }

    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      return {
        success: false,
        data: [],
        error: "Company not found for the current organization.",
      };
    }
    const companyId = company.id;

    // Check asset limit
    const { allowed, usage, limit } = await checkAssetLimit(companyId);
    if (!allowed) {
      return {
        success: false,
        data: [],
        error: `Asset limit reached (${usage}/${limit}). Please upgrade your plan.`,
      };
    }

    const validation = await assetSchema.parseAsync(data);

    if (!validation) {
      return {
        success: false,
        data: [],
        error: "Invalid asset data",
      };
    }

    // Extract templateValues from validation and prepare the create data
    const { templateValues, ...assetData } = validation;

    const asset = await prisma.asset.create({
      data: {
        purchaseDate: new Date(),
        ...assetData,
        companyId: companyId,
        // Add nested creation for form template values if they exist
        values: templateValues
          ? {
              create: [
                {
                  values: templateValues,
                  formTemplate: { connect: { id: assetData.formTemplateId } },
                },
              ],
            }
          : undefined,
      },
      include: {
        model: {
          include: {
            manufacturer: true,
          },
        },
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
        values: true,
      },
    });

    // Calculate and store CO2e record
    if (asset.model) {
      const co2eResponse = await calculateAssetCo2(
        asset.name,
        asset.model.manufacturer.name,
        asset.model.name,
      );

      if (co2eResponse.success) {
        await createCo2eRecord(asset.id, co2eResponse.data);
      } else {
        console.error(
          "Failed to calculate CO2e for asset:",
          co2eResponse.error,
        );
      }
    }

    revalidatePath("/assets");
    return { success: true, data: [parseStringify(asset)], error: undefined };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      error: error?.message || "Failed to create asset",
    };
  }
}

export async function getAllAssets(): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return {
        success: false,
        data: [],
        error: "Unauthorized: No active organization found.",
      };
    }

    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      return {
        success: false,
        data: [],
        error: "Company not found for the current organization.",
      };
    }

    const assets = await prisma.asset.findMany({
      where: {
        companyId: company.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        model: true,
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });

    return {
      success: true,
      data: parseStringify(assets) || [],
      error: undefined,
    };
  } catch (error) {
    console.error("Get assets error:", error);
    return { success: false, data: [], error: "Failed to fetch assets" };
  }
}

export async function getAssetOverview() {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return {
        success: false,
        data: [],
        error: "Unauthorized: No active organization found.",
      };
    }

    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      return {
        success: false,
        data: [],
        error: "Company not found for the current organization.",
      };
    }

    const assetCounts = await prisma.asset.groupBy({
      by: ["modelId"],
      where: {
        companyId: company.id,
      },
      _count: {
        modelId: true,
      },
    });

    const modelIds = assetCounts
      .map((ac) => ac.modelId)
      .filter((id): id is string => !!id);

    const models = await prisma.model.findMany({
      where: {
        id: {
          in: modelIds,
        },
      },
    });

    const modelMap = new Map(models.map((m) => [m.id, m.name]));

    const overview = assetCounts.map((ac) => ({
      name: ac.modelId
        ? modelMap.get(ac.modelId) || "Unknown Model"
        : "Unknown Model",
      count: ac._count.modelId,
    }));

    return { success: true, data: parseStringify(overview) };
  } catch (error) {
    console.error("Get asset overview error:", error);
    return {
      success: false,
      data: [],
      error: "Failed to fetch asset overview",
    };
  }
}

export async function getAssetById(id: string): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error("Unauthorized");

    const asset = await prisma.asset.findFirst({
      where: {
        id,
        company: {
          clerkOrgId: orgId,
        },
      },
      include: {
        model: { include: { manufacturer: true } },
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
        values: { include: { formTemplate: true } },
        co2eRecords: true,
        License: true,
      },
    });
    return { success: true, data: toArray(parseStringify(asset)) };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function removeAsset(id: string): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error("Unauthorized");

    await prisma.asset.deleteMany({
      where: {
        id,
        company: {
          clerkOrgId: orgId,
        },
      },
    });
    revalidatePath("/assets");
    return { success: true, data: [] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function updateAsset(
  id: string,
  data: CreateAssetInput,
): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error("Unauthorized");

    const { templateValues, ...assetData } = await assetSchema.parseAsync(data);

    const updatedAsset = await prisma.asset.update({
      where: {
        id,
        company: {
          clerkOrgId: orgId,
        },
      },
      data: {
        ...assetData,
        values: templateValues
          ? {
              deleteMany: {}, // Delete all previous values
              create: {
                // Create a new value
                values: templateValues,
                formTemplate: { connect: { id: assetData.formTemplateId } },
              },
            }
          : undefined,
      },
      include: {
        model: true,
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
        values: true,
      },
    });
    revalidatePath(`/assets/${id}`);
    return { success: true, data: toArray(parseStringify(updatedAsset)) };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function findAssetById(id: string): Promise<AssetResponse> {
  return getAssetById(id);
}

export async function checkinAsset(id: string): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error("Unauthorized");

    const updatedAsset = await prisma.asset.update({
      where: {
        id,
        company: {
          clerkOrgId: orgId,
        },
      },
      data: {
        assignedTo: null,
      },
    });
    revalidatePath(`/assets/${id}`);
    return { success: true, data: toArray(parseStringify(updatedAsset)) };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function checkoutAsset(
  id: string,
  userId: string,
): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error("Unauthorized");

    const updatedAsset = await prisma.asset.update({
      where: {
        id,
        company: {
          clerkOrgId: orgId,
        },
      },
      data: {
        assignedTo: userId,
      },
    });
    revalidatePath(`/assets/${id}`);
    return { success: true, data: toArray(parseStringify(updatedAsset)) };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function setMaintenanceStatus(
  assetId: string,
): Promise<AssetResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) throw new Error("Unauthorized");

    const maintenanceStatus = await prisma.statusLabel.findFirst({
      where: { name: "In Maintenance" },
    });

    if (!maintenanceStatus) {
      return {
        success: false,
        data: [],
        error: "Maintenance status not found",
      };
    }

    const asset = await prisma.asset.update({
      where: {
        id: assetId,
        company: { clerkOrgId: orgId },
      },
      data: {
        statusLabelId: maintenanceStatus.id,
      },
    });
    revalidatePath(`/assets/${assetId}`);
    return { success: true, data: [parseStringify(asset)] };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

export async function getAssetUtilizationStats(): Promise<AssetUtilizationStatsResponse> {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return {
        success: false,
        error: "Unauthorized: No active organization found.",
      };
    }

    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      return {
        success: false,
        error: "Company not found for the current organization.",
      };
    }

    // Get total assets
    const totalAssets = await prisma.asset.count({
      where: {
        companyId: company.id,
        active: true,
      },
    });

    // Get assigned assets
    const assignedAssets = await prisma.asset.count({
      where: {
        companyId: company.id,
        active: true,
        userId: {
          not: null,
        },
      },
    });

    // Get assets by status
    const assetsByStatus = await prisma.asset.groupBy({
      by: ["statusLabelId"],
      where: {
        companyId: company.id,
        active: true,
      },
      _count: {
        id: true,
      },
    });

    // Get assets by category
    const assetsByCategory = await prisma.asset.groupBy({
      by: ["categoryId"],
      where: {
        companyId: company.id,
        active: true,
      },
      _count: {
        id: true,
      },
    });

    // Get recent assets (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAssets = await prisma.asset.count({
      where: {
        companyId: company.id,
        active: true,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const utilizationData = {
      totalAssets,
      assignedAssets,
      unassignedAssets: totalAssets - assignedAssets,
      utilizationRate:
        totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0,
      assetsByStatus,
      assetsByCategory,
      recentAssets,
    };

    return {
      success: true,
      data: utilizationData,
      error: undefined,
    };
  } catch (error) {
    console.error("Get asset utilization stats error:", error);
    return {
      success: false,
      error: "Failed to fetch asset utilization stats",
    };
  }
}
