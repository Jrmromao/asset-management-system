import { prisma } from "@/app/db";
import { calculateAssetCo2, createCo2eRecord } from "./ai.service";
import { CO2CalculationResult } from "@/types/co2";
import { Prisma } from "@prisma/client";

export interface CO2FootprintStats {
  totalAssets: number;
  assetsWithCO2: number;
  totalCO2e: number;
  averageCO2ePerAsset: number;

  // Scope-based breakdown
  scopeBreakdown: {
    scope1: { total: number; percentage: number };
    scope2: { total: number; percentage: number };
    scope3: { total: number; percentage: number };
  };

  co2ByCategory: Array<{
    category: string;
    totalCO2e: number;
    assetCount: number;
  }>;
  co2ByDepartment: Array<{
    department: string;
    totalCO2e: number;
    assetCount: number;
  }>;
  co2ByScope: Array<{
    scope: number;
    totalCO2e: number;
    assetCount: number;
    categories: string[];
  }>;
  topEmittingAssets: Array<{
    name: string;
    co2e: number;
    category: string;
    primaryScope: number;
  }>;
}

export class CO2FootprintService {
  /**
   * Calculate CO2 footprint for a specific asset
   */
  static async calculateAssetCO2(assetId: string): Promise<{
    success: boolean;
    data?: CO2CalculationResult;
    error?: string;
  }> {
    try {
      // Get asset details
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          model: {
            include: { manufacturer: true },
          },
          category: true,
          department: true,
        },
      });

      if (!asset) {
        return { success: false, error: "Asset not found" };
      }

      if (!asset.model?.manufacturer) {
        return {
          success: false,
          error: "Asset model or manufacturer not found",
        };
      }

      // Calculate CO2 using AI service
      const co2Result = await calculateAssetCo2(
        asset.name,
        asset.model.manufacturer.name,
        asset.model.name,
      );

      if (!co2Result.success || !co2Result.data) {
        return {
          success: false,
          error: co2Result.error || "Failed to calculate CO2",
        };
      }

      // The save operation is now decoupled.
      // await createCo2eRecord(assetId, co2Result.data);

      return { success: true, data: co2Result.data };
    } catch (error: any) {
      console.error("Error calculating asset CO2:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save a CO2 footprint record for a specific asset
   */
  static async saveAssetCO2(
    assetId: string,
    co2Data: CO2CalculationResult,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const existingRecord = await prisma.co2eRecord.findFirst({
        where: { assetId: assetId, itemType: "Asset" },
      });

      const recordData = {
        co2e: co2Data.totalCo2e,
        units: co2Data.units,
        sourceOrActivity: co2Data.sources.map((s) => s.name).join(", "),
        co2eType: "Lifecycle",
        description: co2Data.description,
        details: JSON.stringify(co2Data),

        // New scope classification fields
        scope: co2Data.primaryScope,
        scopeCategory: co2Data.primaryScopeCategory,
        emissionFactor: co2Data.emissionFactors?.[0]
          ? co2Data.totalCo2e / (co2Data.activityData?.weight || 1)
          : null,
        emissionFactorSource: co2Data.emissionFactors?.[0]?.name || null,
        activityData: co2Data.activityData
          ? (co2Data.activityData as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      };

      if (existingRecord) {
        // Update existing record
        const updatedRecord = await prisma.co2eRecord.update({
          where: { id: existingRecord.id },
          data: recordData,
        });
        return { success: true, data: updatedRecord };
      } else {
        // Create new record
        const newRecord = await prisma.co2eRecord.create({
          data: {
            itemType: "Asset",
            ...recordData,
            asset: {
              connect: { id: assetId },
            },
          },
        });
        return { success: true, data: newRecord };
      }
    } catch (error: any) {
      console.error("Error saving asset CO2:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate CO2 footprint for multiple assets
   */
  static async calculateBulkCO2(assetIds: string[]): Promise<{
    success: boolean;
    data?: Array<{ assetId: string; result: CO2CalculationResult }>;
    error?: string;
  }> {
    try {
      const results = [];

      for (const assetId of assetIds) {
        const result = await this.calculateAssetCO2(assetId);
        if (result.success && result.data) {
          results.push({ assetId, result: result.data });
        }
      }

      return { success: true, data: results };
    } catch (error: any) {
      console.error("Error calculating bulk CO2:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get CO2 footprint statistics for a company
   */
  static async getCO2FootprintStats(companyId: string): Promise<{
    success: boolean;
    data?: CO2FootprintStats;
    error?: string;
  }> {
    try {
      // Get all assets with CO2 data
      const assetsWithCO2 = await prisma.asset.findMany({
        where: {
          companyId,
          co2eRecords: { some: {} },
        },
        include: {
          co2eRecords: {
            orderBy: { createdAt: "desc" },
            take: 1, // Get latest CO2 record
          },
          category: true,
          department: true,
        },
      });

      // Get total assets
      const totalAssets = await prisma.asset.count({
        where: { companyId },
      });

      // Calculate totals
      const totalCO2e = assetsWithCO2.reduce((sum, asset) => {
        const latestCO2 = asset.co2eRecords[0];
        return sum + (latestCO2 ? Number(latestCO2.co2e) : 0);
      }, 0);

      // Calculate scope breakdown
      const scopeBreakdown = this.calculateScopeBreakdown(
        assetsWithCO2,
        totalCO2e,
      );

      // Group by category
      const co2ByCategory = this.groupByCategory(assetsWithCO2);

      // Group by department
      const co2ByDepartment = this.groupByDepartment(assetsWithCO2);

      // Group by scope
      const co2ByScope = this.groupByScope(assetsWithCO2);

      // Get top emitting assets
      const topEmittingAssets = assetsWithCO2
        .map((asset) => ({
          name: asset.name,
          co2e: asset.co2eRecords[0] ? Number(asset.co2eRecords[0].co2e) : 0,
          category: asset.category?.name || "Unknown",
          primaryScope: asset.co2eRecords[0]?.scope || 3, // Default to Scope 3 for IT assets
        }))
        .sort((a, b) => b.co2e - a.co2e)
        .slice(0, 10);

      const stats: CO2FootprintStats = {
        totalAssets,
        assetsWithCO2: assetsWithCO2.length,
        totalCO2e,
        averageCO2ePerAsset:
          assetsWithCO2.length > 0 ? totalCO2e / assetsWithCO2.length : 0,
        scopeBreakdown,
        co2ByCategory,
        co2ByDepartment,
        co2ByScope,
        topEmittingAssets,
      };

      return { success: true, data: stats };
    } catch (error: any) {
      console.error("Error getting CO2 footprint stats:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get CO2 footprint for a specific asset
   */
  static async getAssetCO2Footprint(assetId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          co2eRecords: {
            orderBy: { createdAt: "desc" },
          },
          model: {
            include: { manufacturer: true },
          },
          category: true,
          department: true,
        },
      });

      if (!asset) {
        return { success: false, error: "Asset not found" };
      }

      return { success: true, data: asset };
    } catch (error: any) {
      console.error("Error getting asset CO2 footprint:", error);
      return { success: false, error: error.message };
    }
  }

  private static groupByCategory(
    assets: any[],
  ): Array<{ category: string; totalCO2e: number; assetCount: number }> {
    const grouped = assets.reduce((acc, asset) => {
      const category = asset.category?.name || "Unknown";
      const co2e = asset.co2eRecords[0] ? Number(asset.co2eRecords[0].co2e) : 0;

      if (!acc[category]) {
        acc[category] = { totalCO2e: 0, assetCount: 0 };
      }

      acc[category].totalCO2e += co2e;
      acc[category].assetCount += 1;

      return acc;
    }, {});

    return Object.entries(grouped).map(([category, data]: [string, any]) => ({
      category,
      totalCO2e: data.totalCO2e,
      assetCount: data.assetCount,
    }));
  }

  private static groupByDepartment(
    assets: any[],
  ): Array<{ department: string; totalCO2e: number; assetCount: number }> {
    const grouped = assets.reduce((acc, asset) => {
      const department = asset.department?.name || "Unknown";
      const co2e = asset.co2eRecords[0] ? Number(asset.co2eRecords[0].co2e) : 0;

      if (!acc[department]) {
        acc[department] = { totalCO2e: 0, assetCount: 0 };
      }

      acc[department].totalCO2e += co2e;
      acc[department].assetCount += 1;

      return acc;
    }, {});

    return Object.entries(grouped).map(([department, data]: [string, any]) => ({
      department,
      totalCO2e: data.totalCO2e,
      assetCount: data.assetCount,
    }));
  }

  private static groupByScope(assets: any[]): Array<{
    scope: number;
    totalCO2e: number;
    assetCount: number;
    categories: string[];
  }> {
    const grouped = assets.reduce((acc, asset) => {
      const scope = asset.co2eRecords[0]?.scope || 3; // Default to Scope 3 for IT assets
      const co2e = asset.co2eRecords[0] ? Number(asset.co2eRecords[0].co2e) : 0;

      if (!acc[scope]) {
        acc[scope] = { totalCO2e: 0, assetCount: 0, categories: [] };
      }

      acc[scope].totalCO2e += co2e;
      acc[scope].assetCount += 1;
      acc[scope].categories.push(asset.category?.name || "Unknown");

      return acc;
    }, {});

    return Object.entries(grouped).map(([scope, data]: [string, any]) => ({
      scope: Number(scope),
      totalCO2e: data.totalCO2e,
      assetCount: data.assetCount,
      categories: data.categories,
    }));
  }

  private static calculateScopeBreakdown(
    assets: any[],
    totalCO2e: number,
  ): {
    scope1: { total: number; percentage: number };
    scope2: { total: number; percentage: number };
    scope3: { total: number; percentage: number };
  } {
    const scope1Count = assets.filter(
      (a) => a.co2eRecords[0]?.scope === 1,
    ).length;
    const scope2Count = assets.filter(
      (a) => a.co2eRecords[0]?.scope === 2,
    ).length;
    const scope3Count = assets.filter(
      (a) => a.co2eRecords[0]?.scope === 3,
    ).length;

    const scope1Total = assets
      .filter((a) => a.co2eRecords[0]?.scope === 1)
      .reduce(
        (sum, a) =>
          sum + (a.co2eRecords[0] ? Number(a.co2eRecords[0].co2e) : 0),
        0,
      );
    const scope2Total = assets
      .filter((a) => a.co2eRecords[0]?.scope === 2)
      .reduce(
        (sum, a) =>
          sum + (a.co2eRecords[0] ? Number(a.co2eRecords[0].co2e) : 0),
        0,
      );
    const scope3Total = assets
      .filter((a) => a.co2eRecords[0]?.scope === 3)
      .reduce(
        (sum, a) =>
          sum + (a.co2eRecords[0] ? Number(a.co2eRecords[0].co2e) : 0),
        0,
      );

    const scope1Percentage =
      scope1Count > 0 ? (scope1Total / totalCO2e) * 100 : 0;
    const scope2Percentage =
      scope2Count > 0 ? (scope2Total / totalCO2e) * 100 : 0;
    const scope3Percentage =
      scope3Count > 0 ? (scope3Total / totalCO2e) * 100 : 0;

    return {
      scope1: { total: scope1Total, percentage: scope1Percentage },
      scope2: { total: scope2Total, percentage: scope2Percentage },
      scope3: { total: scope3Total, percentage: scope3Percentage },
    };
  }
}
