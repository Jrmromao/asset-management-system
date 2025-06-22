import { prisma } from "@/app/db";
import { calculateAssetCo2, createCo2eRecord } from "./ai.service";
import { CO2CalculationResult } from "@/types/co2";

export interface CO2FootprintStats {
  totalAssets: number;
  assetsWithCO2: number;
  totalCO2e: number;
  averageCO2ePerAsset: number;
  co2ByCategory: Array<{ category: string; totalCO2e: number; assetCount: number }>;
  co2ByDepartment: Array<{ department: string; totalCO2e: number; assetCount: number }>;
  topEmittingAssets: Array<{ name: string; co2e: number; category: string }>;
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
            include: { manufacturer: true }
          },
          category: true,
          department: true
        }
      });

      if (!asset) {
        return { success: false, error: "Asset not found" };
      }

      if (!asset.model?.manufacturer) {
        return { success: false, error: "Asset model or manufacturer not found" };
      }

      // Calculate CO2 using AI service
      const co2Result = await calculateAssetCo2(
        asset.name,
        asset.model.manufacturer.name,
        asset.model.name
      );

      if (!co2Result.success || !co2Result.data) {
        return { success: false, error: co2Result.error || "Failed to calculate CO2" };
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

      if (existingRecord) {
        // Update existing record
        const updatedRecord = await prisma.co2eRecord.update({
          where: { id: existingRecord.id },
          data: {
            co2e: co2Data.totalCo2e,
            units: co2Data.units,
            sourceOrActivity: co2Data.sources.map((s) => s.name).join(", "),
            co2eType: "Lifecycle",
            description: co2Data.description,
            details: JSON.stringify(co2Data),
          },
        });
        return { success: true, data: updatedRecord };
      } else {
        // Create new record
        const newRecord = await prisma.co2eRecord.create({
          data: {
            itemType: "Asset",
            co2e: co2Data.totalCo2e,
            units: co2Data.units,
            sourceOrActivity: co2Data.sources.map((s) => s.name).join(", "),
            co2eType: "Lifecycle",
            description: co2Data.description,
            details: JSON.stringify(co2Data),
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
          co2eRecords: { some: {} }
        },
        include: {
          co2eRecords: {
            orderBy: { createdAt: 'desc' },
            take: 1 // Get latest CO2 record
          },
          category: true,
          department: true
        }
      });

      // Get total assets
      const totalAssets = await prisma.asset.count({
        where: { companyId }
      });

      // Calculate totals
      const totalCO2e = assetsWithCO2.reduce((sum, asset) => {
        const latestCO2 = asset.co2eRecords[0];
        return sum + (latestCO2 ? Number(latestCO2.co2e) : 0);
      }, 0);

      // Group by category
      const co2ByCategory = this.groupByCategory(assetsWithCO2);
      
      // Group by department
      const co2ByDepartment = this.groupByDepartment(assetsWithCO2);

      // Get top emitting assets
      const topEmittingAssets = assetsWithCO2
        .map(asset => ({
          name: asset.name,
          co2e: asset.co2eRecords[0] ? Number(asset.co2eRecords[0].co2e) : 0,
          category: asset.category?.name || 'Unknown'
        }))
        .sort((a, b) => b.co2e - a.co2e)
        .slice(0, 10);

      const stats: CO2FootprintStats = {
        totalAssets,
        assetsWithCO2: assetsWithCO2.length,
        totalCO2e,
        averageCO2ePerAsset: assetsWithCO2.length > 0 ? totalCO2e / assetsWithCO2.length : 0,
        co2ByCategory,
        co2ByDepartment,
        topEmittingAssets
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
            orderBy: { createdAt: 'desc' }
          },
          model: {
            include: { manufacturer: true }
          },
          category: true,
          department: true
        }
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

  private static groupByCategory(assets: any[]): Array<{ category: string; totalCO2e: number; assetCount: number }> {
    const grouped = assets.reduce((acc, asset) => {
      const category = asset.category?.name || 'Unknown';
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
      assetCount: data.assetCount
    }));
  }

  private static groupByDepartment(assets: any[]): Array<{ department: string; totalCO2e: number; assetCount: number }> {
    const grouped = assets.reduce((acc, asset) => {
      const department = asset.department?.name || 'Unknown';
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
      assetCount: data.assetCount
    }));
  }
} 