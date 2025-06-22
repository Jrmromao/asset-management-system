"use server";

import { prisma } from "@/app/db";
import { Prisma } from "@prisma/client";
import { assetSchema } from "@/lib/schemas";
import { AssetResponse } from "@/types/asset";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";
import { withAuth } from "@/lib/middleware/withAuth";
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

// Helper function to validate asset uniqueness within company
const validateAssetUniqueness = async (companyId: string, name: string, serialNumber: string) => {
  const [existingName, existingSerial] = await Promise.all([
    prisma.asset.findFirst({
      where: { name, companyId },
    }),
    prisma.asset.findFirst({
      where: { serialNumber, companyId },
    }),
  ]);

  return {
    nameExists: !!existingName,
    serialExists: !!existingSerial,
  };
};

export const createAsset = withAuth(
  async (
    user,
    data: CreateAssetInput,
  ): Promise<AssetResponse> => {
    console.log(" [assets.actions] createAsset - Starting with user:", {
      userId: user?.id,
      privateMetadata: user?.privateMetadata,
      hasCompanyId: !!user?.privateMetadata?.companyId,
    });

    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        console.error("❌ [assets.actions] createAsset - User missing companyId in private metadata:", {
          user: user?.id,
          privateMetadata: user?.privateMetadata,
        });
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      // Check asset limit
      const { allowed, usage, limit } = await checkAssetLimit(companyId);
      if (!allowed) {
        return {
          success: false,
          data: [],
          error: `Asset limit reached (${usage}/${limit}). Please upgrade your plan.`,
        };
      }

      // Validate asset uniqueness within company
      const uniquenessCheck = await validateAssetUniqueness(companyId, data.name, data.serialNumber);
      
      if (uniquenessCheck.nameExists) {
        return {
          success: false,
          data: [],
          error: "Asset name already exists in your company",
        };
      }

      if (uniquenessCheck.serialExists) {
        return {
          success: false,
          data: [],
          error: "Serial number already exists in your company",
        };
      }

      // Basic validation without the async refinements
      const validation = await assetSchema.omit({
        name: true,
        serialNumber: true,
      }).parseAsync(data);

      if (!validation) {
        return {
          success: false,
          data: [],
          error: "Invalid asset data",
        };
      }

      // Extract templateValues from validation and prepare the create data
      const { templateValues, ...assetData } = validation;

      console.log("✅ [assets.actions] createAsset - Creating asset with data:", {
        ...assetData,
        companyId,
      });

      const asset = await prisma.asset.create({
        data: {
          purchaseDate: new Date(),
          name: data.name,
          serialNumber: data.serialNumber,
          ...assetData,
          companyId,
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

      console.log("✅ [assets.actions] createAsset - Asset created successfully");
      revalidatePath("/assets");
      return { success: true, data: [parseStringify(asset)], error: undefined };
    } catch (error: any) {
      console.error("❌ [assets.actions] createAsset - Error:", error);
      return {
        success: false,
        data: [],
        error: error?.message || "Failed to create asset",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAllAssets = withAuth(
  async (user): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const assets = await prisma.asset.findMany({
        where: {
          companyId,
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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAssetOverview = withAuth(
  async (user): Promise<{ success: boolean; data: any; error?: string }> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAssetById = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const removeAsset = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const updateAsset = withAuth(
  async (
    user,
    id: string,
    data: CreateAssetInput,
  ): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const { templateValues, ...assetData } = await assetSchema.parseAsync(data);

      const updatedAsset = await prisma.asset.update({
        where: {
          id,
          companyId,
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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findAssetById = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    const result = await getAssetById(id);
    return {
      success: result.success,
      data: result.data || [], // Ensure data is always an array
      error: result.error,
    };
  },
);

export const checkinAsset = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const asset = await prisma.asset.update({
        where: {
          id,
          companyId,
        },
        data: {
          userId: null,
          active: true,
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

      revalidatePath("/assets");
      return { success: true, data: toArray(parseStringify(asset)) };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const checkoutAsset = withAuth(
  async (
    user,
    id: string,
    userId: string,
  ): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const asset = await prisma.asset.update({
        where: {
          id,
          companyId,
        },
        data: {
          userId,
          active: false,
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

      revalidatePath("/assets");
      return { success: true, data: toArray(parseStringify(asset)) };
    } catch (error: any) {
      return { success: false, data: [], error: error.message };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const setMaintenanceStatus = withAuth(
  async (user, assetId: string): Promise<AssetResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAssetUtilizationStats = withAuth(
  async (user): Promise<AssetUtilizationStatsResponse> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
        };
      }

      const [
        totalAssets,
        assignedAssets,
        assetsByStatus,
        assetsByCategory,
        recentAssets,
      ] = await Promise.all([
        prisma.asset.count({ where: { companyId } }),
        prisma.asset.count({
          where: { companyId, userId: { not: null } },
        }),
        prisma.asset.groupBy({
          by: ["statusLabelId"],
          where: { companyId },
          _count: { id: true },
        }),
        prisma.asset.groupBy({
          by: ["categoryId"],
          where: { companyId },
          _count: { id: true },
        }),
        prisma.asset.count({
          where: {
            companyId,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]);

      const unassignedAssets = totalAssets - assignedAssets;
      const utilizationRate = totalAssets > 0 ? (assignedAssets / totalAssets) * 100 : 0;

      return {
        success: true,
        data: {
          totalAssets,
          assignedAssets,
          unassignedAssets,
          utilizationRate,
          assetsByStatus,
          assetsByCategory,
          recentAssets,
        },
      };
    } catch (error) {
      console.error("Get asset utilization stats error:", error);
      return {
        success: false,
        error: "Failed to fetch asset utilization stats",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
