import { prisma } from "@/app/db";
import { calculateAssetCo2 } from "./ai-multi-provider.service";
import { CO2CalculationResult } from "@/types/co2";
import crypto from "crypto";

interface AssetFingerprint {
  manufacturer: string;
  model: string;
  category?: string;
  type: string;
}

interface NormalizedAsset {
  manufacturer: string;
  model: string;
  category: string;
  type: string;
  fingerprint: string;
}

export class CO2ConsistencyService {
  /**
   * Create a unique fingerprint for an asset based on its key characteristics
   */
  private static createAssetFingerprint(asset: AssetFingerprint): string {
    // Normalize the asset data to handle variations in naming
    const normalized = this.normalizeAssetData(asset);

    // Create a deterministic hash from normalized data
    const fingerprintData = `${normalized.manufacturer}|${normalized.model}|${normalized.category}|${normalized.type}`;
    return crypto
      .createHash("sha256")
      .update(fingerprintData.toLowerCase())
      .digest("hex");
  }

  /**
   * Normalize asset data to handle different ways of describing the same asset
   */
  private static normalizeAssetData(asset: AssetFingerprint): Omit<NormalizedAsset, "fingerprint"> {
    // Normalize manufacturer names
    const normalizedManufacturer = this.normalizeManufacturer(
      asset.manufacturer,
    );

    // Normalize model names
    const normalizedModel = this.normalizeModel(asset.model);

    // Normalize category
    const normalizedCategory = this.normalizeCategory(
      asset.category || asset.type,
    );

    // Determine asset type from name/model
    const assetType = this.determineAssetType(asset.type, asset.model);

    return {
      manufacturer: normalizedManufacturer,
      model: normalizedModel,
      category: normalizedCategory,
      type: assetType,
    };
  }

  /**
   * Normalize manufacturer names to handle variations
   */
  private static normalizeManufacturer(manufacturer: string): string {
    const normalized = manufacturer.toLowerCase().trim();

    // Handle common manufacturer variations
    const manufacturerMap: Record<string, string> = {
      apple: "apple",
      "apple inc": "apple",
      "apple inc.": "apple",
      dell: "dell",
      "dell inc": "dell",
      "dell inc.": "dell",
      "dell technologies": "dell",
      hp: "hp",
      "hewlett-packard": "hp",
      "hewlett packard": "hp",
      "hp inc": "hp",
      lenovo: "lenovo",
      "lenovo group": "lenovo",
      microsoft: "microsoft",
      "microsoft corporation": "microsoft",
      samsung: "samsung",
      "samsung electronics": "samsung",
      lg: "lg",
      "lg electronics": "lg",
      sony: "sony",
      "sony corporation": "sony",
      asus: "asus",
      asustek: "asus",
      acer: "acer",
      "acer inc": "acer",
    };

    return manufacturerMap[normalized] || normalized;
  }

  /**
   * Normalize model names to handle variations
   */
  private static normalizeModel(model: string): string {
    let normalized = model.toLowerCase().trim();

    // Remove common prefixes/suffixes that don't affect CO2
    normalized = normalized
      .replace(/\s+(laptop|desktop|computer|pc|workstation)$/i, "")
      .replace(/^(laptop|desktop|computer|pc|workstation)\s+/i, "")
      .replace(/\s+(black|white|silver|gray|grey)$/i, "")
      .replace(/\s+\d+gb$/i, "") // Remove storage size
      .replace(/\s+\d+tb$/i, "") // Remove storage size
      .replace(/\s+\d+"$/i, "") // Remove screen size
      .replace(/\s+inch$/i, "") // Remove "inch"
      .trim();

    // Handle specific model variations
    const modelMap: Record<string, string> = {
      "macbook pro 14": "macbook pro 14-inch",
      "macbook pro 16": "macbook pro 16-inch",
      "macbook air 13": "macbook air 13-inch",
      "macbook air 15": "macbook air 15-inch",
      "surface laptop 5": "surface laptop 5",
      "surface pro 9": "surface pro 9",
      "thinkpad x1 carbon": "thinkpad x1 carbon",
      "latitude 5520": "latitude 5520",
      "latitude 7420": "latitude 7420",
    };

    return modelMap[normalized] || normalized;
  }

  /**
   * Normalize category names
   */
  private static normalizeCategory(category: string): string {
    const normalized = category.toLowerCase().trim();

    const categoryMap: Record<string, string> = {
      laptop: "laptop",
      laptops: "laptop",
      notebook: "laptop",
      notebooks: "laptop",
      "portable computer": "laptop",
      desktop: "desktop",
      desktops: "desktop",
      "desktop computer": "desktop",
      pc: "desktop",
      workstation: "workstation",
      workstations: "workstation",
      server: "server",
      servers: "server",
      monitor: "monitor",
      monitors: "monitor",
      display: "monitor",
      displays: "monitor",
      printer: "printer",
      printers: "printer",
      tablet: "tablet",
      tablets: "tablet",
      smartphone: "smartphone",
      phone: "smartphone",
      mobile: "smartphone",
    };

    return categoryMap[normalized] || normalized;
  }

  /**
   * Determine asset type from various inputs
   */
  private static determineAssetType(type: string, model: string): string {
    const combinedText = `${type} ${model}`.toLowerCase();

    if (
      combinedText.includes("laptop") ||
      combinedText.includes("macbook") ||
      combinedText.includes("notebook") ||
      combinedText.includes("surface laptop")
    ) {
      return "laptop";
    }

    if (
      combinedText.includes("desktop") ||
      combinedText.includes("workstation") ||
      combinedText.includes("pc ") ||
      combinedText.includes("imac")
    ) {
      return "desktop";
    }

    if (combinedText.includes("server")) {
      return "server";
    }

    if (combinedText.includes("monitor") || combinedText.includes("display")) {
      return "monitor";
    }

    if (
      combinedText.includes("tablet") ||
      combinedText.includes("ipad") ||
      combinedText.includes("surface pro")
    ) {
      return "tablet";
    }

    if (
      combinedText.includes("phone") ||
      combinedText.includes("smartphone") ||
      combinedText.includes("iphone")
    ) {
      return "smartphone";
    }

    if (combinedText.includes("printer")) {
      return "printer";
    }

    // Default to laptop for unknown types
    return "laptop";
  }

  /**
   * Calculate CO2 with consistency checks
   */
  static async calculateConsistentCO2(
    assetName: string,
    manufacturer: string,
    model: string,
    category?: string,
    forceRecalculate = false,
  ): Promise<{
    success: boolean;
    data?: CO2CalculationResult;
    error?: string;
    source: "cache" | "calculation";
    fingerprint: string;
  }> {
    try {
      // Create asset fingerprint
      const assetFingerprint = this.createAssetFingerprint({
        manufacturer,
        model,
        category,
        type: assetName,
      });

      // Check for existing calculation with the same fingerprint
      if (!forceRecalculate) {
        const existingCalculation = await prisma.co2eRecord.findFirst({
          where: {
            details: {
              path: ["fingerprint"],
              equals: assetFingerprint,
            },
          },
          orderBy: { createdAt: "desc" },
        });

        if (existingCalculation && existingCalculation.details) {
          try {
            const cachedData = JSON.parse(
              existingCalculation.details as string,
            );

            // Validate cached data has all required fields
            if (this.validateCO2Data(cachedData)) {
              console.log(
                `♻️ Using cached CO2 calculation for fingerprint: ${assetFingerprint}`,
              );
              return {
                success: true,
                data: cachedData,
                source: "cache",
                fingerprint: assetFingerprint,
              };
            }
          } catch (parseError) {
            console.warn(`⚠️ Could not parse cached CO2 data, recalculating`);
          }
        }
      }

      // Normalize asset data for consistent AI prompts
      const normalized = this.normalizeAssetData({
        manufacturer,
        model,
        category,
        type: assetName,
      });

      console.log(
        `🔄 Calculating new CO2 for fingerprint: ${assetFingerprint}`,
      );
      console.log(`📝 Normalized asset:`, normalized);

      // Calculate CO2 using normalized data with deterministic parameters
      const co2Result = await calculateAssetCo2(
        normalized.type,
        normalized.manufacturer,
        normalized.model,
        "openai", // Use consistent provider for deterministic results
      );

      if (!co2Result.success || !co2Result.data) {
        return {
          success: false,
          error: co2Result.error || "Failed to calculate CO2",
          source: "calculation",
          fingerprint: assetFingerprint,
        };
      }

      // Add fingerprint and normalization data to the result
      const enhancedData = {
        ...co2Result.data,
        fingerprint: assetFingerprint,
        normalizedAsset: normalized,
        calculationTimestamp: new Date().toISOString(),
        deterministic: true,
      };

      // Store the calculation for future use
      await this.storeCO2Calculation(assetFingerprint, enhancedData);

      return {
        success: true,
        data: enhancedData,
        source: "calculation",
        fingerprint: assetFingerprint,
      };
    } catch (error: any) {
      console.error("❌ Error in consistent CO2 calculation:", error);
      return {
        success: false,
        error: error.message,
        source: "calculation",
        fingerprint: "",
      };
    }
  }

  /**
   * Store CO2 calculation for future reuse
   */
  private static async storeCO2Calculation(
    fingerprint: string,
    co2Data: any,
  ): Promise<void> {
    try {
      await prisma.co2eRecord.create({
        data: {
          itemType: "AssetTemplate", // Special type for fingerprint-based records
          co2e: co2Data.totalCo2e,
          units: co2Data.units || "kgCO2e",
          sourceOrActivity: "AI Calculation (Deterministic)",
          co2eType: "Lifecycle",
          description: `Cached CO2 calculation for asset fingerprint: ${fingerprint}`,
          details: JSON.stringify(co2Data),
          scope: co2Data.primaryScope,
          scopeCategory: co2Data.primaryScopeCategory,
          emissionFactor: co2Data.emissionFactors?.[0]
            ? co2Data.totalCo2e / (co2Data.activityData?.weight || 1)
            : null,
          emissionFactorSource: co2Data.emissionFactors?.[0]?.name || null,
          activityData: co2Data.activityData || null,
        },
      });

      console.log(`💾 Stored CO2 calculation for fingerprint: ${fingerprint}`);
    } catch (error) {
      console.warn(`⚠️ Failed to store CO2 calculation:`, error);
      // Don't fail the main calculation if storage fails
    }
  }

  /**
   * Validate CO2 data has all required fields
   */
  private static validateCO2Data(data: any): boolean {
    const requiredFields = [
      "totalCo2e",
      "units",
      "confidenceScore",
      "lifecycleBreakdown",
      "scopeBreakdown",
      "primaryScope",
      "methodology",
    ];

    return (
      requiredFields.every((field) => field in data) &&
      data.totalCo2e > 0 &&
      data.confidenceScore >= 0 &&
      data.confidenceScore <= 1
    );
  }

  /**
   * Get asset fingerprint for an existing asset
   */
  static async getAssetFingerprint(assetId: string): Promise<string | null> {
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          model: {
            include: { manufacturer: true },
          },
          category: true,
        },
      });

      if (!asset?.model?.manufacturer) {
        return null;
      }

      return this.createAssetFingerprint({
        manufacturer: asset.model.manufacturer.name,
        model: asset.model.name,
        category: asset.category?.name,
        type: asset.name,
      });
    } catch (error) {
      console.error("Error getting asset fingerprint:", error);
      return null;
    }
  }

  /**
   * Find similar assets based on fingerprint
   */
  static async findSimilarAssets(
    manufacturer: string,
    model: string,
    category?: string,
    type?: string,
  ): Promise<{
    fingerprint: string;
    similarAssets: Array<{
      id: string;
      name: string;
      manufacturer: string;
      model: string;
      category?: string;
    }>;
  }> {
    const fingerprint = this.createAssetFingerprint({
      manufacturer,
      model,
      category,
      type: type || "laptop",
    });

    // This would require adding fingerprint field to Asset table
    // For now, return empty array
    return {
      fingerprint,
      similarAssets: [],
    };
  }

  /**
   * Clear cached CO2 calculations (for admin use)
   */
  static async clearCO2Cache(
    fingerprint?: string,
  ): Promise<{ success: boolean; deletedCount: number }> {
    try {
      const whereClause = fingerprint
        ? {
            itemType: "AssetTemplate",
            details: {
              path: ["fingerprint"],
              equals: fingerprint,
            },
          }
        : { itemType: "AssetTemplate" };

      const result = await prisma.co2eRecord.deleteMany({
        where: whereClause,
      });

      return { success: true, deletedCount: result.count };
    } catch (error) {
      console.error("Error clearing CO2 cache:", error);
      return { success: false, deletedCount: 0 };
    }
  }
}
