"use server";

import { assetSchema } from "@/lib/schemas";
import { AssetResponse, AssetWithRelations } from "@/types/asset";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";
import { withAuth } from "@/lib/middleware/withAuth";
import { checkAssetLimit } from "@/lib/services/usage.service";
import { calculateAssetCo2, createCo2eRecord } from "@/lib/services/ai.service";
import { handleError } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/app/db";
import { Prisma } from "@prisma/client";

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

export type CreateAssetInput = z.infer<typeof assetSchema>;

// Helper function to convert single item to array
const toArray = <T>(item: T | null): T[] => (item ? [item] : []);

// Helper function to validate asset uniqueness within company
const validateAssetUniqueness = async (
  companyId: string,
  name: string,
  assetTag: string,
) => {
  const [existingName, existingAssetTag] = await Promise.all([
    prisma.asset.findFirst({
      where: { name, companyId },
    }),
    prisma.asset.findFirst({
      where: { assetTag, companyId },
    }),
  ]);

  return {
    nameExists: !!existingName,
    assetTagExists: !!existingAssetTag,
  };
};

const serializeAsset = (asset: any) => {
  if (!asset) {
    return null;
  }
  const serialized = { ...asset };
  if (asset.purchasePrice) {
    serialized.purchasePrice = Number(asset.purchasePrice);
  }
  if (asset.currentValue) {
    serialized.currentValue = Number(asset.currentValue);
  }
  if (asset.depreciationRate) {
    serialized.depreciationRate = Number(asset.depreciationRate);
  }
  if (asset.energyConsumption) {
    serialized.energyConsumption = Number(asset.energyConsumption);
  }
  if (asset.co2eRecords && Array.isArray(asset.co2eRecords)) {
    serialized.co2eRecords = asset.co2eRecords.map((record: any) => ({
      ...record,
      co2e: record.co2e ? Number(record.co2e) : null,
    }));
  }
  return serialized;
};

export const createAsset = withAuth(
  async (user, data: CreateAssetInput): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        throw new Error("User is not associated with a company");
      }

      const { allowed, usage, limit } = await checkAssetLimit(companyId);
      if (!allowed) {
        throw new Error(
          `Asset limit reached (${usage}/${limit}). Please upgrade your plan.`,
        );
      }

      const { name, assetTag, templateValues, modelId, ...rest } =
        await assetSchema.parseAsync(data);

      const asset = await prisma.asset.create({
        data: {
          ...rest,
          name,
          assetTag,
          modelId,
          companyId,
          purchaseDate: new Date(),
          values: templateValues
            ? {
                create: {
                  values: templateValues,
                  formTemplate: { connect: { id: rest.formTemplateId } },
                },
              }
            : undefined,
        },
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          user: true,
        },
      });

      if (asset.model) {
        const co2eResponse = await calculateAssetCo2(
          asset.name,
          asset.model.manufacturer.name,
          asset.model.name,
        );
        if (co2eResponse.success) {
          await createCo2eRecord(asset.id, co2eResponse.data);
        }
      }

      revalidatePath("/assets");
      return {
        success: true,
        data: [parseStringify(serializeAsset(asset))],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  },
);

export async function getAllAssets() {
  const { orgId: authOrgId } = await auth();
  const user = await currentUser();
  const orgId = authOrgId || (user?.privateMetadata?.clerkOrgId as string);

  if (!orgId) {
    throw new Error("Organization ID not found");
  }

  try {
    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      throw new Error("Company not found");
    }

    const assets = await prisma.asset.findMany({
      where: { companyId: company.id },
      include: {
        model: { include: { manufacturer: true } },
        statusLabel: true,
        co2eRecords: true,
        category: true,
      },
    });

    const serializableAssets = assets.map(serializeAsset);

    return { success: true, data: serializableAssets };
  } catch (error) {
    return {
      success: false,
      data: [],
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export const getAssetOverview = withAuth(
  async (user): Promise<{ success: boolean; data: any; error?: string }> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const assetCounts = await prisma.asset.groupBy({
        by: ["modelId"],
        where: {
          companyId,
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
  },
);

export const getAssetById = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const asset = await prisma.asset.findUnique({
        where: { id, companyId },
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          department: true,
          departmentLocation: true,
          inventory: true,
          category: true,
          values: true,
          co2eRecords: true,
          assetHistory: true,
          user: true,
          supplier: true,
          purchaseOrder: true,
          formTemplate: true,
        },
      });

      if (!asset) {
        return {
          success: false,
          data: [],
          error: "Asset not found",
        };
      }

      return { success: true, data: toArray(parseStringify(asset)) };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  },
);

export const removeAsset = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      await prisma.asset.deleteMany({
        where: {
          id,
          companyId,
        },
      });
      revalidatePath("/assets");
      return { success: true, data: [] };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },
);

export const updateAsset = withAuth(
  async (user, id: string, data: CreateAssetInput): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const { name, assetTag, templateValues, ...assetData } =
        await assetSchema.parseAsync(data);

      const updatedAsset = await prisma.asset.update({
        where: { id, companyId },
        data: {
          ...assetData,
          name,
          assetTag,
          values: templateValues
            ? {
                deleteMany: { assetId: id },
                create: {
                  values: templateValues,
                  formTemplate: { connect: { id: assetData.formTemplateId } },
                },
              }
            : undefined,
        },
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          co2eRecords: true,
        },
      });

      revalidatePath(`/assets/${id}`);
      return {
        success: true,
        data: [parseStringify(serializeAsset(updatedAsset))],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  },
);

export const findAssetById = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const result = await getAssetById(id);
      return {
        success: result.success,
        data: result.data || [],
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  },
);

export const checkinAsset = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;

      if (!companyId) {
        return {
          success: false,
          data: [],
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

        // Get the current asset to track who it was assigned to
        const currentAsset = await tx.asset.findUnique({
          where: { id, companyId },
          select: { userId: true },
        });

        // Update the asset
        const asset = await tx.asset.update({
          where: {
            id,
            companyId,
          },
          data: {
            userId: null,
          },
          include: {
            model: { include: { manufacturer: true } },
            statusLabel: true,
            co2eRecords: true,
          },
        });

        // Create audit log entry
        await tx.auditLog.create({
          data: {
            action: "ASSET_CHECKIN",
            entity: "ASSET",
            entityId: id,
            userId: internalUser.id,
            companyId,
            details: currentAsset?.userId
              ? `Asset returned from user ${currentAsset.userId}`
              : "Asset checked in",
          },
        });

        // Create asset history entry
        await tx.assetHistory.create({
          data: {
            assetId: id,
            type: "return",
            companyId,
            notes: currentAsset?.userId
              ? `Asset checked in from user ${currentAsset.userId}`
              : "Asset checked in",
          },
        });

        return asset;
      });

      revalidatePath("/assets");
      return {
        success: true,
        data: toArray(parseStringify(serializeAsset(result))),
      };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },
);

export const checkoutAsset = withAuth(
  async (user, id: string, userId: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;

      if (!companyId) {
        return {
          success: false,
          data: [],
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

        // Update the asset
        const asset = await tx.asset.update({
          where: { id, companyId },
          data: { userId },
          include: {
            model: { include: { manufacturer: true } },
            statusLabel: true,
            department: true,
            departmentLocation: true,
            inventory: true,
            category: true,
            values: true,
            co2eRecords: true,
            assetHistory: true,
            user: true,
            supplier: true,
            purchaseOrder: true,
            formTemplate: true,
          },
        });

        // Create audit log entry
        await tx.auditLog.create({
          data: {
            action: "ASSET_CHECKOUT",
            entity: "ASSET",
            entityId: id,
            userId: internalUser.id,
            companyId,
            details: `Asset assigned to user ${userId}`,
          },
        });

        // Create asset history entry
        await tx.assetHistory.create({
          data: {
            assetId: id,
            type: "assignment",
            companyId,
            notes: `Asset checked out to user ${userId}`,
          },
        });

        return asset;
      });

      revalidatePath(`/assets/${id}`);
      return {
        success: true,
        data: toArray(parseStringify(serializeAsset(result))),
      };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },
);

export const setMaintenanceStatus = withAuth(
  async (user, assetId: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const asset = await prisma.asset.findFirst({
        where: {
          id: assetId,
          companyId,
        },
        include: {
          model: true,
        },
      });

      if (!asset) {
        return {
          success: false,
          data: [],
          error: "Asset not found",
        };
      }

      const maintenance = await prisma.maintenance.create({
        data: {
          assetId,
          statusLabelId: "scheduled",
          title: "Scheduled Maintenance",
          startDate: new Date(),
          isWarranty: false,
          technicianId: user.id,
          notes: "Scheduled maintenance for asset",
        },
      });

      revalidatePath("/assets");
      return { success: true, data: toArray(parseStringify(maintenance)) };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    }
  },
);

export const getAssetUtilizationStats = withAuth(
  async (user): Promise<AssetUtilizationStatsResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const totalAssets = await prisma.asset.count({
        where: { companyId },
      });

      const assignedAssets = await prisma.asset.count({
        where: { companyId, NOT: { userId: null } },
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAssets = await prisma.asset.count({
        where: { companyId, createdAt: { gte: thirtyDaysAgo } },
      });

      const assetsByStatus = await prisma.asset.groupBy({
        by: ["statusLabelId"],
        where: { companyId },
        _count: { id: true },
      });

      const assetsByCategory = await prisma.asset.groupBy({
        by: ["categoryId"],
        where: { companyId },
        _count: { id: true },
      });

      const unassignedAssets = totalAssets - assignedAssets;
      const utilizationRate =
        totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0;

      return {
        success: true,
        data: {
          totalAssets,
          assignedAssets,
          unassignedAssets: unassignedAssets,
          utilizationRate,
          assetsByStatus,
          assetsByCategory,
          recentAssets,
        },
      };
    } catch (error) {
      return handleError(error, {
        totalAssets: 0,
        assignedAssets: 0,
        unassignedAssets: 0,
        utilizationRate: 0,
        assetsByStatus: [],
        assetsByCategory: [],
        recentAssets: 0,
      });
    }
  },
);

export const getAssetStats = withAuth(async (user) => {
  try {
    const companyId = user.privateMetadata?.companyId as string;
    if (!companyId) {
      return {
        success: false,
        data: {
          total: 0,
          assigned: 0,
          maintenance: 0,
        },
        error: "User not associated with a company",
      };
    }
    const total = await prisma.asset.count({ where: { companyId } });
    const assigned = await prisma.asset.count({
      where: { companyId, userId: { not: null } },
    });
    const maintenance = await prisma.asset.count({
      where: {
        companyId,
        statusLabel: { name: { contains: "maintenance", mode: "insensitive" } },
      },
    });

    return {
      success: true,
      data: {
        total,
        assigned,
        maintenance,
      },
    };
  } catch (error) {
    return handleError(error, {
      total: 0,
      assigned: 0,
      maintenance: 0,
    });
  }
});

export const getAssetCountByStatus = withAuth(async (user) => {
  try {
    const companyId = user.privateMetadata?.companyId as string;
    if (!companyId) {
      return {
        success: false,
        data: [],
        error: "User not associated with a company",
      };
    }
    const result = await prisma.asset.groupBy({
      by: ["statusLabelId"],
      where: { companyId },
      _count: {
        statusLabelId: true,
      },
    });

    const statusLabels = await prisma.statusLabel.findMany({
      where: { id: { in: result.map((r) => r.statusLabelId as string) } },
    });

    const statusMap = statusLabels.reduce(
      (acc, label) => {
        acc[label.id] = label.name;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      success: true,
      data: result.map((item) => ({
        status: statusMap[item.statusLabelId as string],
        count: item._count.statusLabelId,
      })),
    };
  } catch (error) {
    return handleError(error, []);
  }
});

export const findById = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const asset = await prisma.asset.findFirst({
        where: {
          id,
          companyId,
        },
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          user: true,
          category: true,
        },
      });

      if (!asset) {
        return {
          success: false,
          data: [],
          error: "Asset not found",
        };
      }

      return {
        success: true,
        data: [parseStringify(serializeAsset(asset))],
      };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        error: error.message,
      };
    }
  },
);

export const processAssetCSV = withAuth(
  async (user, csvContent: string): Promise<AssetResponse> => {
    // Add your CSV processing logic here
    // For now, return a placeholder
    return {
      success: false,
      data: [],
      error: "CSV processing not yet implemented",
    };
  },
);

export const exportAssetsToCSV = withAuth(
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

      const assets = await prisma.asset.findMany({
        where: { companyId },
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          user: true,
          category: true,
        },
      });

      // Simple CSV export - you can enhance this
      const csvHeaders = "Name,Asset Tag,Status,Category,Assigned To\n";
      const csvRows = assets
        .map(
          (asset) =>
            `"${asset.name}","${asset.assetTag}","${asset.statusLabel?.name || ""}","${asset.category?.name || ""}","${asset.user?.name || ""}"`,
        )
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
    }
  },
);
