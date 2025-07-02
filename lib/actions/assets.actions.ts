"use server";

import { assetSchema } from "@/lib/schemas";
import { AssetWithRelations } from "@/types/asset";
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
import { createAuditLog } from "@/lib/actions/auditLog.actions";
import levenshtein from "js-levenshtein";
import { getEnhancedAssetById } from "@/lib/services/asset.service";
import { EnhancedAssetType } from "@/lib/services/asset.service";
import { diff } from 'just-diff';

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

// Utility to deeply convert Decimal-like objects to numbers
function deepConvertDecimals(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "object") {
    if (typeof obj.toNumber === "function") return obj.toNumber();
    if (Array.isArray(obj)) return obj.map(deepConvertDecimals);
    const result: any = {};
    for (const key in obj) {
      result[key] = deepConvertDecimals(obj[key]);
    }
    return result;
  }
  return obj;
}

const serializeAsset = (asset: any) => {
  if (!asset) {
    return null;
  }
  const serialized = { ...asset };
  // Serialize top-level date fields
  const dateFields = [
    'createdAt', 'updatedAt', 'purchaseDate', 'warrantyEndDate', 'endOfLife', 'nextMaintenance'
  ];
  for (const field of dateFields) {
    const value = serialized[field];
    if (value instanceof Date) {
      serialized[field] = value.toISOString();
    } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      serialized[field] = new Date(value).toISOString();
    }
  }
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
  // Serialize co2eRecords date fields
  if (asset.co2eRecords && Array.isArray(asset.co2eRecords)) {
    serialized.co2eRecords = asset.co2eRecords.map((record: any) => {
      const serializedRecord = {
        ...record,
        co2e: record.co2e ? Number(record.co2e) : null,
        emissionFactor:
          record.emissionFactor !== undefined && record.emissionFactor !== null
            ? Number(record.emissionFactor)
            : undefined,
        lifecycleManufacturing:
          record.lifecycleManufacturing !== undefined &&
          record.lifecycleManufacturing !== null
            ? Number(record.lifecycleManufacturing)
            : undefined,
        lifecycleTransport:
          record.lifecycleTransport !== undefined &&
          record.lifecycleTransport !== null
            ? Number(record.lifecycleTransport)
            : undefined,
        lifecycleUse: record.lifecycleUse ? Number(record.lifecycleUse) : null,
        lifecycleEndOfLife:
          record.lifecycleEndOfLife !== undefined &&
          record.lifecycleEndOfLife !== null
            ? Number(record.lifecycleEndOfLife)
            : undefined,
        amortizedMonthlyCo2e:
          record.amortizedMonthlyCo2e !== undefined &&
          record.amortizedMonthlyCo2e !== null
            ? Number(record.amortizedMonthlyCo2e)
            : undefined,
        amortizedAnnualCo2e:
          record.amortizedAnnualCo2e !== undefined &&
          record.amortizedAnnualCo2e !== null
            ? Number(record.amortizedAnnualCo2e)
            : undefined,
        expectedLifespanYears:
          record.expectedLifespanYears !== undefined &&
          record.expectedLifespanYears !== null
            ? Number(record.expectedLifespanYears)
            : undefined,
      };
      // Serialize date fields in co2eRecords
      const co2eDateFields = ['createdAt', 'updatedAt'];
      for (const field of co2eDateFields) {
        const value = serializedRecord[field];
        if (value instanceof Date) {
          serializedRecord[field] = value.toISOString();
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          serializedRecord[field] = new Date(value).toISOString();
        }
      }
      // Recursively convert Decimals in activityData
      if (record.activityData) {
        try {
          if (typeof record.activityData === "string") {
            const parsed = JSON.parse(record.activityData);
            serializedRecord.activityData = deepConvertDecimals(parsed);
          } else {
            serializedRecord.activityData = deepConvertDecimals(
              record.activityData,
            );
          }
        } catch {
          serializedRecord.activityData = record.activityData;
        }
      }
      // Parse and serialize the details JSON to handle any Decimal objects
      if (record.details) {
        try {
          const parsedDetails =
            typeof record.details === "string"
              ? JSON.parse(record.details)
              : record.details;
          serializedRecord.details = JSON.stringify(
            deepConvertDecimals(parsedDetails),
          );
        } catch (parseError) {
          // If parsing fails, keep the original details
          serializedRecord.details = record.details;
        }
      }
      return serializedRecord;
    });
  }
  // Serialize auditLogs date fields if present
  if (asset.auditLogs && Array.isArray(asset.auditLogs)) {
    serialized.auditLogs = asset.auditLogs.map((log: any) => {
      const serializedLog = { ...log };
      const auditLogDateFields = ['createdAt', 'updatedAt'];
      for (const field of auditLogDateFields) {
        const value = serializedLog[field];
        if (value instanceof Date) {
          serializedLog[field] = value.toISOString();
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          serializedLog[field] = new Date(value).toISOString();
        }
      }
      return serializedLog;
    });
  }
  return serialized;
};

export type AssetResponse = {
  success: boolean;
  data: EnhancedAssetType[];
  error?: string;
};

const EXCLUDED_FIELDS = new Set([
  "updatedAt",
  "co2eRecords",
  // add more if needed
]);

function generateSummary(
  changes: Record<string, { before: any; after: any }>,
  before: Record<string, any>,
  after: Record<string, any>
): string {
  const fieldSummaries: string[] = [];
  for (const field of Object.keys(changes)) {
    if (EXCLUDED_FIELDS.has(field)) continue; // Skip excluded fields

    let beforeValue = changes[field].before;
    let afterValue = changes[field].after;

    // --- RELATIONS: Compare by ID ---
    if (field === "model") {
      const beforeId = before.modelId || before.model?.id || beforeValue;
      const afterId = after.modelId || after.model?.id || afterValue;
      if (beforeId === afterId) continue; // No real change
      beforeValue = before.model?.name || beforeId;
      afterValue = after.model?.name || afterId;
    } else if (field === "statusLabel") {
      const beforeId = before.statusLabelId || before.statusLabel?.id || beforeValue;
      const afterId = after.statusLabelId || after.statusLabel?.id || afterValue;
      if (beforeId === afterId) continue;
      beforeValue = before.statusLabel?.name || beforeId;
      afterValue = after.statusLabel?.name || afterId;
    } else if (field === "supplier") {
      const beforeId = before.supplierId || before.supplier?.id || beforeValue;
      const afterId = after.supplierId || after.supplier?.id || afterValue;
      if (beforeId === afterId) continue;
      beforeValue = before.supplier?.name || beforeId;
      afterValue = after.supplier?.name || afterId;
    }
    // --- ARRAYS: Only log if content changed ---
    else if (Array.isArray(beforeValue) || Array.isArray(afterValue)) {
      if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) continue;
      beforeValue = Array.isArray(beforeValue) ? `[${beforeValue.length} items]` : beforeValue;
      afterValue = Array.isArray(afterValue) ? `[${afterValue.length} items]` : afterValue;
    }
    // --- PRIMITIVES/OTHER: Only log if value changed ---
    else if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) {
      continue;
    }

    if (typeof beforeValue === "object" && beforeValue !== null) beforeValue = JSON.stringify(beforeValue);
    if (typeof afterValue === "object" && afterValue !== null) afterValue = JSON.stringify(afterValue);

    fieldSummaries.push(`${field}: ${beforeValue} → ${afterValue}`);
  }
  return fieldSummaries.length
    ? `Updated asset fields:\n` + fieldSummaries.join("\n")
    : "Asset updated";
}

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
          formValues: templateValues
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
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "ASSET_CREATED",
        entity: "ASSET",
        entityId: asset.id,
        details: `Asset created: ${asset.name} (${asset.assetTag}) by user ${user.id}`,
      });
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

export const getAllAssets = withAuth(
  async (
    user,
    options?: {
      page?: number;
      pageSize?: number;
      search?: string;
      sort?: string;
      status?: string;
      department?: string;
      model?: string;
    },
  ): Promise<{
    success: boolean;
    data: any[];
    total: number;
    page: number;
    pageSize: number;
    error?: string;
  }> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          error: "User is not associated with a company",
        };
      }
      // Defaults
      const page = options?.page && options.page > 0 ? options.page : 1;
      const pageSize = options?.pageSize && options.pageSize > 0 ? options.pageSize : 10;
      const skip = (page - 1) * pageSize;
      const take = pageSize;
      // Filters
      const where: any = { companyId };
      if (options?.status) where.statusLabelId = options.status;
      if (options?.department) where.departmentId = options.department;
      if (options?.model) where.modelId = options.model;
      if (options?.search) {
        where.OR = [
          { name: { contains: options.search, mode: "insensitive" } },
          { assetTag: { contains: options.search, mode: "insensitive" } },
        ];
      }
      // Sorting
      let orderBy: any = { updatedAt: "desc" };
      if (options?.sort) {
        // Example: "name:asc" or "purchaseDate:desc"
        const [field, dir] = options.sort.split(":");
        orderBy = { [field]: dir === "desc" ? "desc" : "asc" };
      }
      // Query total count
      const total = await prisma.asset.count({ where });
      // Query paginated data
      const assets = await prisma.asset.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          co2eRecords: true,
          category: true,
          formValues: {
            include: {
              formTemplate: {
                include: { category: true },
              },
            },
          },
        },
      });
      const serializableAssets = assets.map(serializeAsset);
      return {
        success: true,
        data: serializableAssets,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
);

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
      const asset = await getEnhancedAssetById(id, companyId);
      if (!asset) {
        return {
          success: false,
          data: [],
          error: "Asset not found",
        };
      }
      return {
        success: true,
        data: [asset],
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

      // Get asset info before deletion for audit log
      const asset = await prisma.asset.findUnique({ where: { id, companyId } });
      await prisma.asset.deleteMany({
        where: {
          id,
          companyId,
        },
      });
      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "ASSET_DELETED",
        entity: "ASSET",
        entityId: id,
        details: asset
          ? `Asset deleted: ${asset.name} (${asset.assetTag}) by user ${user.id}\nBefore: ${JSON.stringify(asset)}`
          : `Asset deleted (ID: ${id}) by user ${user.id}`,
        dataAccessed: asset ? { before: asset } : undefined,
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
        console.log(`[updateAsset] User not associated with a company. User: ${user.id}`);
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      // Get asset before update for audit log
      const beforeAsset = await prisma.asset.findUnique({ where: { id, companyId } });

      const { name, assetTag, templateValues, statusLabelId, ...assetData } =
        await assetSchema.parseAsync(data);

      // Explicit validation for statusLabelId
      let statusLabelChanged = false;
      if (typeof statusLabelId === "string" && statusLabelId !== beforeAsset?.statusLabelId) {
        console.log(`[updateAsset] Attempting status label update for asset ${id}: ${beforeAsset?.statusLabelId} -> ${statusLabelId}`);
        const statusLabel = await prisma.statusLabel.findFirst({
          where: { id: statusLabelId, companyId },
        });
        if (!statusLabel) {
          console.log(`[updateAsset] Invalid status label: ${statusLabelId} for asset ${id}`);
          return {
            success: false,
            data: [],
            error: "Invalid status label selected.",
          };
        }
        statusLabelChanged = true;
      }

      // Destructure and remove relation IDs from assetData before spreading
      const {
        departmentId,
        supplierId,
        inventoryId,
        locationId,
        modelId,
        userId,
        formTemplateId,
        purchaseOrderId,
        licenseId,
        ...assetDataWithoutRelations
      } = assetData;

      const updatedAsset = await prisma.asset.update({
        where: { id, companyId },
        data: {
          ...assetDataWithoutRelations,
          name,
          assetTag,
          statusLabel: statusLabelId ? { connect: { id: statusLabelId } } : undefined,
          department: departmentId ? { connect: { id: departmentId } } : undefined,
          supplier: supplierId ? { connect: { id: supplierId } } : undefined,
          inventory: inventoryId ? { connect: { id: inventoryId } } : undefined,
          departmentLocation: locationId ? { connect: { id: locationId } } : undefined,
          model: modelId ? { connect: { id: modelId } } : undefined,
          user: userId ? { connect: { id: userId } } : undefined,
          purchaseOrder: purchaseOrderId ? { connect: { id: purchaseOrderId } } : undefined,
          License: licenseId ? { connect: { id: licenseId } } : undefined,
          formValues: templateValues
            ? {
                deleteMany: { assetId: id },
                create: {
                  values: templateValues,
                  formTemplate: formTemplateId
                    ? { connect: { id: formTemplateId } }
                    : (() => { throw new Error("formTemplateId is required when updating form values"); })(),
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
      console.log(`[updateAsset] Asset updated: ${id}`);
      // --- AUDIT LOG ---
      // Compute diff (only changed fields, shallow for now)
      function getChangedFields(before: Record<string, any>, after: Record<string, any>): Record<string, { before: any; after: any }> {
        const changes: { [key: string]: { before: any; after: any } } = {};
        for (const key of Object.keys(after)) {
          if (before[key] !== after[key]) {
            changes[key] = { before: before[key], after: after[key] };
          }
        }
        return changes;
      }
      const changes = getChangedFields(beforeAsset || {}, updatedAsset || {});
      const summary = generateSummary(changes, beforeAsset || {}, updatedAsset || {});
      await createAuditLog({
        companyId,
        action: "ASSET_UPDATED",
        entity: "ASSET",
        entityId: id,
        details: summary,
        dataAccessed: { changes },
      });
      if (statusLabelChanged) {
        console.log(`[updateAsset] Status label successfully updated for asset ${id}: ${statusLabelId}`);
        await createAuditLog({
          companyId,
          action: "ASSET_STATUS_UPDATED",
          entity: "ASSET",
          entityId: id,
          details: `Asset status changed to ${updatedAsset.statusLabel?.name} (${updatedAsset.statusLabelId}) by user ${user.id}`,
          dataAccessed: { before: beforeAsset, after: updatedAsset },
        });
      }
      revalidatePath(`/assets/${id}`);
      return {
        success: true,
        data: [parseStringify(serializeAsset(updatedAsset))],
      };
    } catch (error: any) {
      console.error(`[updateAsset] Error updating asset ${id || "unknown"}:`, error);
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
          select: { userId: true, name: true, assetTag: true },
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

        // Use tx.auditLog.create for consistency inside the transaction
        await tx.auditLog.create({
          data: {
            companyId,
            userId: internalUser.id,
            action: "ASSET_CHECKIN",
            entity: "ASSET",
            entityId: id,
            details: currentAsset?.userId
              ? `Asset returned from user ${currentAsset.userId} (${currentAsset.name} - ${currentAsset.assetTag})`
              : `Asset checked in (${currentAsset?.name} - ${currentAsset?.assetTag})`,
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

        // Get the current asset to track who it was assigned to
        const currentAsset = await tx.asset.findUnique({
          where: { id, companyId },
          select: { userId: true, name: true, assetTag: true },
        });

        // Update the asset
        const asset = await tx.asset.update({
          where: {
            id,
            companyId,
          },
          data: {
            userId,
          },
          include: {
            model: { include: { manufacturer: true } },
            statusLabel: true,
            co2eRecords: true,
          },
        });

        // Use tx.auditLog.create for consistency inside the transaction
        await tx.auditLog.create({
          data: {
            companyId,
            userId: internalUser.id,
            action: "ASSET_CHECKOUT",
            entity: "ASSET",
            entityId: id,
            details: `Asset assigned to user ${userId} (${currentAsset?.name} - ${currentAsset?.assetTag})`,
          },
        });

        // Create asset history entry
        await tx.assetHistory.create({
          data: {
            assetId: id,
            type: "checkout",
            companyId,
            notes: `Asset checked out to user ${userId}`,
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

      // Look up the status label ID for 'Scheduled' for this company
      const scheduledStatus = await prisma.statusLabel.findFirst({
        where: { name: { equals: "Scheduled", mode: "insensitive" }, companyId },
      });
      if (!scheduledStatus) {
        return {
          success: false,
          data: [],
          error: "Scheduled status label not found. Please ensure a 'Scheduled' status label exists.",
        };
      }

      const maintenance = await prisma.maintenance.create({
        data: {
          assetId,
          statusLabelId: scheduledStatus.id,
          title: "Scheduled Maintenance",
          startDate: new Date(),
          isWarranty: false,
          notes: "Scheduled maintenance for asset",
        },
      });



      await createAuditLog({
        companyId,
        action: "ASSET_SET_MAINTENANCE",
        entity: "ASSET",
        entityId: assetId,
        details: `Asset set to maintenance: ${asset.name} (${asset.assetTag}) by user ${user.id}`,
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
    // --- AUDIT LOG (placeholder, only log if import is successful) ---
    // await createAuditLog({
    //   companyId: user.privateMetadata?.companyId as string,
    //   action: "ASSET_IMPORTED",
    //   entity: "ASSET",
    //   details: `Asset import attempted by user ${user.id}`,
    // });
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

      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "ASSET_EXPORTED",
        entity: "ASSET",
        details: `Assets exported to CSV by user ${user.id}`,
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
    }
  },
);

export const getAssetDistribution = withAuth(
  async (user): Promise<{ success: boolean; data: any[]; error?: string }> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      // Fetch all assets with formValues and formTemplate.category
      const assets = await prisma.asset.findMany({
        where: { companyId },
        include: {
          formValues: {
            include: {
              formTemplate: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // Group assets by the requested category name logic
      const categoryMap = new Map<string, { count: number; assigned: number }>();
      let totalAssets = 0;
      for (const asset of assets) {
        const categoryName = asset.formValues?.[0]?.formTemplate?.category?.name ?? "N/A";
        totalAssets++;
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, { count: 0, assigned: 0 });
        }
        categoryMap.get(categoryName)!.count++;
        if (asset.userId) {
          categoryMap.get(categoryName)!.assigned++;
        }
      }

      // Build distribution data
      const distributionData = Array.from(categoryMap.entries()).map(([name, { count, assigned }]) => {
        const percentage = totalAssets > 0 ? (count / totalAssets) * 100 : 0;
        const utilization = count > 0 ? Math.round((assigned / count) * 100) : 0;
        let status: "Healthy" | "Warning" | "Critical" = "Healthy";
        if (utilization < 30) {
          status = "Critical";
        } else if (utilization < 70) {
          status = "Warning";
        }
        return {
          name,
          count,
          percentage: Math.round(percentage),
          status,
          utilization,
        };
      });

      // Sort by count descending
      distributionData.sort((a, b) => b.count - a.count);

      return { success: true, data: distributionData };
    } catch (error) {
      return {
        success: false,
        data: [],
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  },
);

export const updateAssetNotes = withAuth(
  async (user, id: string, notes: string): Promise<AssetResponse> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          data: [],
          error: "User is not associated with a company",
        };
      }

      const updatedAsset = await prisma.asset.update({
        where: { id, companyId },
        data: { notes },
        include: {
          model: { include: { manufacturer: true } },
          statusLabel: true,
          co2eRecords: true,
        },
      });

      // --- AUDIT LOG ---
      await createAuditLog({
        companyId,
        action: "ASSET_NOTES_UPDATED",
        entity: "ASSET",
        entityId: id,
        details: `Asset notes updated for ${updatedAsset.name} (${updatedAsset.assetTag}) by user ${user.id}`,
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

export const bulkCreateAssets = withAuth(
  async (user, assets: Partial<CreateAssetInput>[]): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      console.log("[BULK IMPORT] Function called");
      console.log("[BULK IMPORT] User:", user?.id);
      const companyId = user.privateMetadata?.companyId as string;
      console.log("[BULK IMPORT] companyId:", companyId);
      if (!companyId) {
        console.error("[BULK IMPORT] No companyId found for user");
        return { success: false, count: 0, error: "User is not associated with a company" };
      }

      // Log incoming asset data
      console.log("\n\n[BULK IMPORT] Incoming assets:", JSON.stringify(assets, null, 2));

      // Fetch all dependencies for the company
      console.log("[BULK IMPORT] Fetching dependencies...");
      const [models, suppliers, statusLabels, categories, departments, locations, inventories, users, formTemplates, licenses, purchaseOrders] = await Promise.all([
        prisma.model.findMany({ where: { companyId } }),
        prisma.supplier.findMany({ where: { companyId } }),
        prisma.statusLabel.findMany({ where: { companyId } }),
        prisma.category.findMany({ where: { companyId } }),
        prisma.department.findMany({ where: { companyId } }),
        prisma.departmentLocation.findMany({ where: { companyId } }),
        prisma.inventory.findMany({ where: { companyId } }),
        prisma.user.findMany({ where: { companyId } }),
        prisma.formTemplate.findMany({ where: { companyId } }),
        prisma.license.findMany({ where: { companyId } }),
        prisma.purchaseOrder.findMany({ where: { companyId } }),
      ]);
      console.log("[BULK IMPORT] Dependencies fetched.");

      // Helper for fuzzy matching by name (or other fields)
      function fuzzyFindId(arr: { id: string; name?: string; email?: string; assetTag?: string; poNumber?: string }[], input?: string): string | undefined {
        if (!input) return undefined;
        const normalized = input.trim().toLowerCase();
        // Try name
        let match = arr.find(item => item.name && item.name.toLowerCase() === normalized);
        if (match) return match.id;
        match = arr.find(item => item.name && item.name.toLowerCase().startsWith(normalized));
        if (match) return match.id;
        match = arr.find(item => item.name && item.name.toLowerCase().includes(normalized));
        if (match) return match.id;
        match = arr.find(item => item.name && item.name.toLowerCase().startsWith(normalized));
        if (match) return match.id;
        // Try email (for user)
        match = arr.find(item => item.email && item.email.toLowerCase() === normalized);
        if (match) return match.id;
        // Try assetTag (for asset)
        match = arr.find(item => item.assetTag && item.assetTag.toLowerCase() === normalized);
        if (match) return match.id;
        // Try poNumber (for purchase order)
        match = arr.find(item => item.poNumber && item.poNumber.toLowerCase() === normalized);
        if (match) return match.id;
        return undefined;
      }
      // Helper to get value from multiple possible keys
      const getField = (obj: any, ...keys: string[]) => {
        for (const key of keys) {
          if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
            return obj[key];
          }
        }
        return undefined;
      };

      // Map of dependencies to handle
      const dependencyMap = [
        { key: "modelId", arr: models, inputKeys: ["modelName", "Model"] },
        { key: "supplierId", arr: suppliers, inputKeys: ["supplierName", "Supplier"] },
        { key: "statusLabelId", arr: statusLabels, inputKeys: ["statusLabelName", "Status Label"] },
        { key: "categoryId", arr: categories, inputKeys: ["categoryName", "Category"] },
        { key: "departmentId", arr: departments, inputKeys: ["departmentName", "Department"] },
        { key: "locationId", arr: locations, inputKeys: ["locationName", "Location"] },
        { key: "inventoryId", arr: inventories, inputKeys: ["inventoryName", "Inventory"] },
        { key: "userId", arr: users, inputKeys: ["userEmail", "userName", "Assigned To", "User"] },
        { key: "formTemplateId", arr: formTemplates, inputKeys: ["formTemplateName", "Form Template"] },
        { key: "licenseId", arr: licenses, inputKeys: ["licenseName", "License"] },
        { key: "purchaseOrderId", arr: purchaseOrders, inputKeys: ["purchaseOrderNumber", "poNumber", "Purchase Order"] },
      ];

      console.log("[BULK IMPORT] Mapping assets...");
      const assetsToCreate: Prisma.AssetCreateManyInput[] = assets
        .filter(asset => asset.name && asset.assetTag) // Only include valid records
        .map(asset => {
          const depIds: Record<string, string | null> = {};
          for (const dep of dependencyMap) {
            const value = dep.inputKeys.map(k => getField(asset, k)).find(v => v);
            depIds[dep.key] = fuzzyFindId(dep.arr, value) || null;
          }
          const cleanField = (value: any) => (value === undefined ? null : value);

          return {
            name: asset.name as string,
            assetTag: asset.assetTag as string,
            companyId,
            ...depIds,
            purchaseDate: (asset as any)?.purchaseDate ? new Date((asset as any).purchaseDate) : new Date(),
            notes: cleanField(asset.notes),
            endOfLifePlan: cleanField(asset.endOfLifePlan),
            energyConsumption: cleanField(asset.energyConsumption),
            expectedLifespan: cleanField(asset.expectedLifespan),
            warrantyEndDate: cleanField(asset.warrantyEndDate),
            // Add more fields as needed, following the same pattern
          };
        });

      // 1. Bulk insert assets
      console.log("[BULK IMPORT] Creating assets in DB...");
      await prisma.asset.createMany({
        data: assetsToCreate,
        skipDuplicates: true,
      });
      console.log("[BULK IMPORT] Asset creation complete.");

      // 2. Fetch inserted assets by assetTag
      console.log("[BULK IMPORT] Fetching inserted assets...");
      const assetTags = assetsToCreate.map(a => a.assetTag);
      const insertedAssets = await prisma.asset.findMany({
        where: { assetTag: { in: assetTags }, companyId },
        select: { id: true, assetTag: true },
      });
      console.log("[BULK IMPORT] insertedAssets:", JSON.stringify(insertedAssets, null, 2));

      // Helper to extract only valid custom field values for a given template
      function extractFormTemplateValues(asset: any, formTemplateId: string, templateFieldMap: Map<string, any>): Record<string, any> | null {
        const fields = templateFieldMap.get(formTemplateId);
        if (!Array.isArray(fields)) return null;
        const values: Record<string, any> = {};
        for (const field of fields) {
          // Try both field.name and field.label for flexibility
          values[field.name] = asset[field.name] ?? asset[field.label] ?? null;
        }
        return values;
      }

      // Fetch all relevant form templates and their fields
      const formTemplateIds = Array.from(new Set(assets.map(a => a.formTemplateId).filter((id): id is string => typeof id === 'string')));
      const formTemplatesForMapping = await prisma.formTemplate.findMany({
        where: { id: { in: formTemplateIds } },
        select: { id: true, fields: true }, // fields assumed to be JSON or relation
      });
      // Build a map for quick lookup
      const templateFieldMap = new Map(formTemplatesForMapping.map(t => [t.id, t.fields]));

      console.log("[BULK IMPORT] Mapping form template values...");
      const formTemplateValuesToCreate = insertedAssets.map(asset => {
        const original = assets.find(a => a.assetTag === asset.assetTag);
        if (!original?.formTemplateId) return null;
        const values = extractFormTemplateValues(original, original.formTemplateId, templateFieldMap);
        if (!values) return null;
        return {
          assetId: asset.id,
          templateId: original.formTemplateId,
          values,
        };
      }).filter(Boolean) as { assetId: string; templateId: string; values: any }[];
      console.log("[BULK IMPORT] formTemplateValuesToCreate:", JSON.stringify(formTemplateValuesToCreate, null, 2));

      // 5. Bulk insert FormTemplateValue
      if (formTemplateValuesToCreate.length > 0) {
        console.log("[BULK IMPORT] Creating form template values in DB...");
        await prisma.formTemplateValue.createMany({ data: formTemplateValuesToCreate });
        console.log("[BULK IMPORT] Form template value creation complete.");
      }

      await createAuditLog({
        companyId,
        action: "BULK_ASSET_CREATED",
        entity: "ASSET",
        details: `Bulk asset creation: ${assetsToCreate.length} assets created by user ${user.id}`,
      });
      revalidatePath("/assets");
      console.log("[BULK IMPORT] Bulk import complete.");
      return { success: true, count: assetsToCreate.length };
    } catch (error: any) {
      console.error("[BULK IMPORT] Error:", error);
      return { success: false, count: 0, error: error.message };
    }
  }
);

/**
 * Returns the count of unique assets with scheduled maintenance within the next 30 days for the given companyId.
 */
export async function getMaintenanceDueCount(companyId: string): Promise<number> {
  // Start of today
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  // End of the 30th day
  const in30Days = new Date(now);
  in30Days.setDate(now.getDate() + 30);
  in30Days.setHours(23, 59, 59, 999);

  const maintenanceDueAssets = await prisma.maintenance.findMany({
    where: {
      startDate: {
        gte: now,
        lte: in30Days,
      },
      asset: {
        companyId,
      },
    },
    select: { assetId: true },
  });

  const uniqueAssetIds = new Set(maintenanceDueAssets.map(m => m.assetId));
  return uniqueAssetIds.size;
}
