"use server";

import { prisma } from "@/app/db";
import { DepreciationCalculator, MarketConditions } from "@/lib/utils/depreciation";
import { auth } from "@clerk/nextjs/server";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export async function calculateAssetDepreciation(
  assetId: string,
  method?: "straightLine" | "decliningBalance" | "doubleDecliningBalance" | "auto",
  asOfDate?: Date,
  marketConditions?: MarketConditions
) {
  try {
    const { sessionClaims } = await auth();
    const companyId = (sessionClaims?.privateMetadata as { companyId?: string })?.companyId as string;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId, companyId },
      include: {
        category: true,
        model: {
          include: {
            manufacturer: true,
          }
        },
        formValues: {
          include: {
            formTemplate: {
              include: {
                category: true,
              }
            }
          }
        }
      },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    const calculationDate = asOfDate || new Date();
    let result;

    switch (method) {
      case "straightLine":
        result = DepreciationCalculator.straightLine(asset, calculationDate);
        break;
      case "decliningBalance":
        result = DepreciationCalculator.decliningBalance(asset, calculationDate);
        break;
      case "doubleDecliningBalance":
        result = DepreciationCalculator.doubleDecliningBalance(asset, calculationDate);
        break;
      case "auto":
      default:
        result = DepreciationCalculator.autoCalculate(asset, calculationDate, marketConditions);
        break;
    }

    // Update asset with calculated current value
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        currentValue: result.currentValue,
        depreciationRate: asset.purchasePrice ? result.annualDepreciation / Number(asset.purchasePrice) : null,
      },
    });

    // Log the calculation
    await createAuditLog({
      action: "DEPRECIATION_CALCULATED",
      entity: "Asset",
      entityId: assetId,
      details: `Depreciation calculated using ${result.method} method. Current value: $${result.currentValue.toFixed(2)}. Confidence: ${(result.confidence * 100).toFixed(0)}%. ${result.reasoning}`,
      companyId,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error calculating depreciation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function generateDepreciationSchedule(
  assetId: string,
  method: "straightLine" | "decliningBalance" | "doubleDecliningBalance" = "straightLine",
  marketConditions?: MarketConditions
) {
  try {
    const { sessionClaims } = await auth();
    const companyId = (sessionClaims?.privateMetadata as { companyId?: string })?.companyId as string;

    const asset = await prisma.asset.findUnique({
      where: { id: assetId, companyId },
      include: {
        category: true,
        model: true
      },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    const schedule = DepreciationCalculator.generateSchedule(asset, method, new Date(), marketConditions);

    return {
      success: true,
      data: {
        asset: {
          id: asset.id,
          name: asset.name,
          purchasePrice: Number(asset.purchasePrice),
          purchaseDate: asset.purchaseDate,
          expectedLifespan: asset.expectedLifespan,
        },
        schedule,
        method,
        marketConditions,
      },
    };
  } catch (error) {
    console.error("Error generating depreciation schedule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function calculatePortfolioDepreciation(companyId?: string, marketConditions?: MarketConditions) {
  try {
    // Get company ID from auth if not provided
    if (!companyId) {
      const { sessionClaims } = await auth();
      companyId = (sessionClaims?.privateMetadata as { companyId?: string })?.companyId as string;
    }

    if (!companyId) {
      throw new Error("Company ID not found");
    }

    // Get all assets for the company with enhanced relations
    const assets = await prisma.asset.findMany({
      where: { companyId, active: true },
      include: {
        category: true,
        model: {
          include: {
            manufacturer: true,
          }
        },
        formValues: {
          include: {
            formTemplate: {
              include: {
                category: true,
              }
            }
          }
        }
      },
    });

    const portfolioData = DepreciationCalculator.calculatePortfolioDepreciation(assets, new Date(), marketConditions);

    return {
      success: true,
      data: portfolioData,
    };
  } catch (error) {
    console.error("Error calculating portfolio depreciation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateAssetDepreciation(assetId: string, marketConditions?: MarketConditions) {
  try {
    const { sessionClaims } = await auth();
    const companyId = (sessionClaims?.privateMetadata as { companyId?: string })?.companyId as string;

    const result = await calculateAssetDepreciation(assetId, "auto", undefined, marketConditions);

    if (result.success) {
      return {
        success: true,
        data: result.data,
        message: "Asset depreciation updated successfully",
      };
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error updating asset depreciation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// New function to get market conditions
export async function getMarketConditions(): Promise<MarketConditions> {
  // This could be enhanced to fetch real market data from APIs
  // For now, returning default conditions
  return {
    technologyTrend: 'accelerating',
    industryGrowth: 'medium',
    supplyChainImpact: 'low',
    regulatoryChanges: 'minor',
    economicConditions: 'stable',
  };
} 