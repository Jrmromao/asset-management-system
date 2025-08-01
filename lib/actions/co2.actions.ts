"use server";

import { prisma } from "@/app/db";
import CO2Calculator, { CO2CalculationInput } from "@/services/OpenAI/index";
import { handleError } from "@/lib/utils";
import { OpenAIConfigConst } from "@/config/OpenAIConfig";
import { GeminiConfigConst } from "@/config/GeminiConfig";
import { auth } from "@clerk/nextjs/server";
import { CO2FootprintService } from "@/lib/services/co2Footprint.service";
import { CO2CalculationResult } from "@/types/co2";
import { co2Store } from "@/lib/stores/co2Store";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export async function generateCo2eForAsset(
  assetId: string,
  forceRecalculate = false,
) {
  try {
    const existingRecord = await prisma.co2eRecord.findFirst({
      where: { assetId },
    });

    if (existingRecord && !forceRecalculate) {
      return {
        success: true,
        data: existingRecord,
        message: "CO2e record already exists.",
      };
    }

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        category: true,
        department: true,
        model: { include: { manufacturer: true } },
      },
    });

    if (!asset) {
      throw new Error(`Asset with ID ${assetId} not found.`);
    }

    const calculationInput: CO2CalculationInput = {
      name: asset.name,
      category: asset.category?.name,
      department: asset.department?.name,
      yearOfManufacture: asset.purchaseDate
        ? new Date(asset.purchaseDate).getFullYear()
        : undefined,
      expectedLifespan: asset.depreciationRate
        ? Number(asset.depreciationRate)
        : undefined,
    };

    const co2Calculator = new CO2Calculator({
      openai: OpenAIConfigConst,
      gemini: GeminiConfigConst,
    });

    const co2Response = await co2Calculator.calculateCO2e(
      calculationInput,
      "openai",
    );

    const co2eData = {
      assetId,
      co2e: co2Response.CO2e,
      units: co2Response.unit,
      sourceOrActivity: co2Response.sourceOrActivity,
      co2eType: "Lifecycle",
      description: co2Response.details,
      itemType: "Asset",
    };

    const record = await prisma.co2eRecord.upsert({
      where: { id: existingRecord?.id || "" },
      update: co2eData,
      create: co2eData,
    });

    return { success: true, data: record };
  } catch (error) {
    return handleError(error, "generateCo2eForAsset");
  }
}

export const getTotalCo2Savings = async () => {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return { data: 0, error: "Unauthorized: No active organization found." };
    }

    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      return {
        data: 0,
        error: "Company not found for the current organization.",
      };
    }

    // Get total CO2e savings from all assets
    const totalCo2e = await prisma.co2eRecord.aggregate({
      where: {
        asset: {
          companyId: company.id,
          active: true,
        },
        itemType: "Asset",
      },
      _sum: {
        co2e: true,
      },
    });

    const totalSavings = totalCo2e._sum.co2e || 0;

    // Convert from kg to tons (1 ton = 1000 kg)
    const savingsInTons = Number(totalSavings) / 1000;

    return { data: Math.round(savingsInTons * 100) / 100, error: null };
  } catch (error) {
    return handleError(error, "getCo2SavingsTrend");
  }
};

export const getCo2SavingsTrend = async () => {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return { data: 0, error: "Unauthorized: No active organization found." };
    }

    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });

    if (!company) {
      return {
        data: 0,
        error: "Company not found for the current organization.",
      };
    }

    // Get CO2e records from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCo2e = await prisma.co2eRecord.aggregate({
      where: {
        asset: {
          companyId: company.id,
          active: true,
        },
        itemType: "Asset",
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _sum: {
        co2e: true,
      },
    });

    const recentSavings = recentCo2e._sum.co2e || 0;
    const recentSavingsInTons = Number(recentSavings) / 1000;

    return { data: Math.round(recentSavingsInTons * 100) / 100, error: null };
  } catch (error) {
    return handleError(error, "getCo2SavingsTrend");
  }
};

export async function getCO2DataFromStore(storeKey: string) {
  try {
    console.log("🔍 Attempting to retrieve data with key:", storeKey);
    console.log("🔍 Current store keys:", co2Store.getAllKeys());

    const data = co2Store.get(storeKey);
    if (!data) {
      console.log("❌ Data not found for key:", storeKey);
      console.log("🔍 Available keys in store:", co2Store.getAllKeys());
      return { success: false, error: "CO2 data not found in store" };
    }

    console.log("✅ Retrieved complete data from store:", storeKey);
    console.log("🔍 Retrieved scope breakdown:", data.scopeBreakdown);

    return { success: true, data };
  } catch (error: any) {
    console.error("❌ Error retrieving CO2 data from store:", error);
    return { success: false, error: error.message };
  }
}

export async function calculateAssetCO2Action(assetId: string) {
  try {
    const result = await CO2FootprintService.calculateAssetCO2(assetId);

    // Add detailed logging for debugging
    console.log("🔍 Server action result:", result);
    if (result.success && result.data) {
      console.log(
        "🔍 Server action scope breakdown:",
        result.data.scopeBreakdown,
      );
      console.log("🔍 Server action scope totals:", {
        scope1: result.data.scopeBreakdown?.scope1?.total,
        scope2: result.data.scopeBreakdown?.scope2?.total,
        scope3: result.data.scopeBreakdown?.scope3?.total,
      });

      // Test serialization before returning
      const serializedData = JSON.parse(JSON.stringify(result.data));
      console.log("🔍 Serialized data keys:", Object.keys(serializedData));
      console.log(
        "🔍 Serialized scope breakdown:",
        serializedData.scopeBreakdown,
      );

      // Store complete data in memory store to work around Next.js serialization issues
      const storeKey = `co2_${assetId}_${Date.now()}`;
      co2Store.set(storeKey, result.data);

      console.log("🔍 Stored complete data with key:", storeKey);
      console.log(
        "🔍 Stored data scope breakdown:",
        result.data.scopeBreakdown,
      );

      // Return minimal data with store key
      const minimalData = {
        totalCo2e: result.data.totalCo2e,
        units: result.data.units,
        confidenceScore: result.data.confidenceScore,
        storeKey: storeKey,
        testField: "THIS_IS_A_TEST_TO_VERIFY_CLIENT_RECEIVES_NEW_FORMAT",
      };

      console.log("🔍 Minimal data object:", minimalData);
      console.log("🔍 Minimal data keys:", Object.keys(minimalData));
      console.log("🔍 Store key value:", storeKey);
      console.log("🔍 Returning minimal data with store key to client");

      // Final return - this should only have 5 keys now (including testField)
      const finalReturn = { success: true, data: minimalData };
      console.log("🔍 Final return object:", finalReturn);
      console.log("🔍 Final return data keys:", Object.keys(finalReturn.data));

      return finalReturn;
    }

    return result;
  } catch (error: any) {
    console.error("Error in calculateAssetCO2Action:", error);
    return { success: false, error: error.message };
  }
}

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

export async function saveAssetCO2Action(
  assetId: string,
  co2Data: CO2CalculationResult,
) {
  try {
    // Get current user for audit log
    const { sessionClaims } = await auth();
    const companyId = (sessionClaims?.privateMetadata as { companyId?: string })
      ?.companyId as string;
    // Check if there is an existing CO2 record for this asset
    const existingRecord = await prisma.co2eRecord.findFirst({
      where: { assetId, itemType: "Asset" },
      orderBy: { createdAt: "desc" },
    });

    // Save the new CO2 record
    const result = await CO2FootprintService.saveAssetCO2(assetId, co2Data);

    if (result.success && result.data) {
      // Convert all Decimal fields to numbers to prevent serialization issues
      const record = result.data;
      const serializedRecord = {
        ...record,
        co2e: record.co2e ? Number(record.co2e) : null,
        emissionFactor: record.emissionFactor
          ? Number(record.emissionFactor)
          : null,
        lifecycleManufacturing: record.lifecycleManufacturing
          ? Number(record.lifecycleManufacturing)
          : null,
        lifecycleTransport: record.lifecycleTransport
          ? Number(record.lifecycleTransport)
          : null,
        lifecycleUse: record.lifecycleUse ? Number(record.lifecycleUse) : null,
        lifecycleEndOfLife: record.lifecycleEndOfLife
          ? Number(record.lifecycleEndOfLife)
          : null,
        amortizedMonthlyCo2e: record.amortizedMonthlyCo2e
          ? Number(record.amortizedMonthlyCo2e)
          : null,
        amortizedAnnualCo2e: record.amortizedAnnualCo2e
          ? Number(record.amortizedAnnualCo2e)
          : null,
        expectedLifespanYears: record.expectedLifespanYears
          ? Number(record.expectedLifespanYears)
          : null,
      };
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
          serializedRecord.details = record.details;
        }
      }
      // --- AUDIT LOG ---
      const action = existingRecord ? "CO2_OVERRIDDEN" : "CO2_CALCULATED";
      const details = `CO2e: ${serializedRecord.co2e}, Confidence: ${co2Data.confidenceScore}`;
      await createAuditLog({
        companyId,
        action,
        entity: "ASSET",
        entityId: assetId,
        details,
      });
      return {
        ...result,
        data: serializedRecord,
      };
    }

    return result;
  } catch (error: any) {
    console.error("Error in saveAssetCO2Action:", error);
    return { success: false, error: error.message };
  }
}
