import { prisma } from "@/app/db";
import { parseStringify } from "@/lib/utils";
import { getDepreciationRecommendation } from "@/lib/services/ai.service";

export interface EnhancedAssetType {
  id: string;
  name: string;
  assetTag?: string;
  depreciationMethod?: string | null;
  reorderPoint?: number | null;
  endOfLife?: Date | null;
  nextMaintenance?: Date | null;
  notes?: string | null;
  purchaseDate?: Date;
  warrantyEndDate?: Date | null;
  expectedLifespan?: number | null;
  energyConsumption?: number | null;
  endOfLifePlan?: string | null;
  active?: boolean;
  companyId?: string;
  categoryId?: string | null;
  statusLabelId?: string | null;
  supplierId?: string | null;
  departmentId?: string | null;
  locationId?: string | null;
  inventoryId?: string | null;
  userId?: string | null;
  modelId?: string | null;
  formTemplateId?: string | null;
  purchaseOrderId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  model?: any;
  manufacturer?: any;
  statusLabel?: any;
  department?: any;
  departmentLocation?: any;
  inventory?: any;
  category?: any;
  formValues?: any[];
  co2eRecords?: any[];
  assetHistory?: any[];
  user?: any;
  supplier?: any;
  purchaseOrder?: any;
  auditLogs?: any[];
  price?: number;
  purchaseOrderNumber?: string;
  purchaseCost?: number;
  co2Score?: { co2e: number; units: string };
  belowReorderPoint?: boolean;
  categoryName: string;
  modelName: string;
  manufacturerName: string;
  locationName: string;
  aiRecommendedDepreciationMethod?: string;
  aiDepreciationReasoning?: string;
}

function deepConvertDecimals(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj;
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

export async function getEnhancedAssetById(id: string, companyId: string): Promise<EnhancedAssetType | null> {
  const asset = await prisma.asset.findUnique({
    where: { id, companyId },
    include: {
      model: { include: { manufacturer: true } },
      statusLabel: true,
      department: true,
      departmentLocation: true,
      inventory: true,
      category: true,
      formValues: {
        include: {
          formTemplate: {
            include: {
              category: true,
            },
          },
        },
      },
      co2eRecords: {
        select: {
          id: true,
          co2e: true,
          units: true,
          createdAt: true,
          updatedAt: true,
          co2eType: true,
          sourceOrActivity: true,
          description: true,
          details: true,
          scope: true,
          scopeCategory: true,
          emissionFactor: true,
          emissionFactorSource: true,
          activityData: true,
          lifecycleManufacturing: true,
          lifecycleTransport: true,
          lifecycleUse: true,
          lifecycleEndOfLife: true,
          expectedLifespanYears: true,
          amortizedMonthlyCo2e: true,
          amortizedAnnualCo2e: true,
        }
      },
      assetHistory: true,
      user: true,
      supplier: true,
      purchaseOrder: true,
    },
  });
  if (!asset) return null;
  // Debug: log co2eRecords and their createdAt fields
  if (asset.co2eRecords && Array.isArray(asset.co2eRecords)) {
    console.log('[DEBUG] co2eRecords:', asset.co2eRecords.map(r => ({ id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt })));
  } else {
    console.log('[DEBUG] No co2eRecords found or not an array:', asset.co2eRecords);
  }
  const auditLogs = await prisma.auditLog.findMany({
    where: { entity: "ASSET", entityId: id, companyId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
  let belowReorderPoint = false;
  if (typeof asset.reorderPoint === "number" && asset.reorderPoint > 0) {
    belowReorderPoint = !asset.userId;
  }
  const safeAsset = deepConvertDecimals(asset);
  const safeAuditLogs = deepConvertDecimals(auditLogs);

  // --- AI-powered depreciation recommendation (real AI call) ---
  let aiRecommendedDepreciationMethod = "straightLine";
  let aiDepreciationReasoning = "Based on the asset's category and typical usage, straight-line depreciation is recommended for predictable value loss.";
  try {
    const aiResult = await getDepreciationRecommendation(
      {
        id: safeAsset.id,
        name: safeAsset.name,
        category: safeAsset.category?.name,
        model: safeAsset.model?.name,
        manufacturer: safeAsset.model?.manufacturer?.name,
        purchaseDate: safeAsset.purchaseDate,
        expectedLifespan: safeAsset.expectedLifespan,
        energyConsumption: safeAsset.energyConsumption,
        notes: safeAsset.notes,
        assetTag: safeAsset.assetTag,
      },
      safeAsset.assetHistory || []
    );
    aiRecommendedDepreciationMethod = aiResult.method;
    aiDepreciationReasoning = aiResult.reasoning;
  } catch (e) {
    // fallback to stub logic if AI call fails
    if (safeAsset.category?.name?.toLowerCase().includes("tech") || safeAsset.modelName?.toLowerCase().includes("laptop")) {
      aiRecommendedDepreciationMethod = "doubleDecliningBalance";
      aiDepreciationReasoning = "This asset is technology-related and likely to lose value quickly due to obsolescence. Double declining balance is recommended for accelerated depreciation.";
    } else if (safeAsset.assetHistory && safeAsset.assetHistory.length > 5) {
      aiRecommendedDepreciationMethod = "decliningBalance";
      aiDepreciationReasoning = "This asset has a rich usage history, suggesting higher early-year depreciation. Declining balance is recommended.";
    }
  }

  // Determine category from formValues[0].formTemplate.category if present
  let categoryFromForm: any = null;
  let categoryNameFromForm: string | undefined = undefined;
  if (safeAsset.formValues && Array.isArray(safeAsset.formValues) && safeAsset.formValues.length > 0) {
    const formTemplateCategory = safeAsset.formValues[0]?.formTemplate?.category;
    if (formTemplateCategory) {
      categoryFromForm = formTemplateCategory;
      categoryNameFromForm = formTemplateCategory.name;
    }
  }

  return {
    ...safeAsset,
    auditLogs: safeAuditLogs ?? [],
    belowReorderPoint,
    category: categoryFromForm || safeAsset.category,
    categoryName: categoryNameFromForm || safeAsset.category?.name || 'N/A',
    modelName: safeAsset.model?.name ?? 'N/A',
    manufacturerName: safeAsset.model?.manufacturer?.name ?? 'N/A',
    locationName: safeAsset.departmentLocation?.name ?? 'N/A',
    aiRecommendedDepreciationMethod,
    aiDepreciationReasoning,
  };
} 