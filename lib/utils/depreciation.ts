import { Asset } from "@prisma/client";

export interface DepreciationMethod {
  name: string;
  description: string;
  calculate: (asset: Asset, asOfDate?: Date) => DepreciationResult;
}

export interface DepreciationResult {
  currentValue: number;
  totalDepreciation: number;
  annualDepreciation: number;
  monthlyDepreciation: number;
  depreciationPercentage: number;
  remainingLife: number;
  nextDepreciationDate: Date;
  method: string;
  calculationDate: Date;
  confidence: number;
  reasoning: string;
  marketAdjustments?: {
    multiplier: number;
    factors: string[];
  };
}

export interface DepreciationSchedule {
  year: number;
  beginningValue: number;
  depreciation: number;
  endingValue: number;
  accumulatedDepreciation: number;
  marketValue?: number;
}

export interface MarketConditions {
  technologyTrend: 'accelerating' | 'stable' | 'declining';
  industryGrowth: 'high' | 'medium' | 'low';
  supplyChainImpact: 'high' | 'medium' | 'low';
  regulatoryChanges: 'significant' | 'minor' | 'none';
  economicConditions: 'boom' | 'stable' | 'recession';
}

export class DepreciationCalculator {
  private static readonly DEFAULT_DEPRECIATION_RATE = 0.15; // 15% annual
  private static readonly DEFAULT_LIFESPAN = 5; // 5 years
  private static readonly HIGH_VALUE_THRESHOLD = 10000; // $10k threshold for high-value assets

  /**
   * Enhanced Straight Line Depreciation
   */
  static straightLine(asset: Asset, asOfDate: Date = new Date()): DepreciationResult {
    const purchasePrice = Number(asset.purchasePrice) || 0;
    const purchaseDate = asset.purchaseDate;
    const lifespan = asset.expectedLifespan || this.DEFAULT_LIFESPAN;
    
    if (!purchaseDate || purchasePrice <= 0) {
      return this.getDefaultResult(asset, asOfDate);
    }

    const yearsSincePurchase = this.calculateYearsSincePurchase(purchaseDate, asOfDate);
    const annualDepreciation = purchasePrice / lifespan;
    const totalDepreciation = Math.min(annualDepreciation * yearsSincePurchase, purchasePrice);
    const currentValue = Math.max(purchasePrice - totalDepreciation, 0);
    const remainingLife = Math.max(lifespan - yearsSincePurchase, 0);

    return {
      currentValue,
      totalDepreciation,
      annualDepreciation,
      monthlyDepreciation: annualDepreciation / 12,
      depreciationPercentage: (totalDepreciation / purchasePrice) * 100,
      remainingLife,
      nextDepreciationDate: this.getNextDepreciationDate(purchaseDate, asOfDate),
      method: "Straight Line",
      calculationDate: asOfDate,
      confidence: 0.9,
      reasoning: "Standard straight-line depreciation with equal annual amounts",
    };
  }

  /**
   * Enhanced Declining Balance Depreciation
   */
  static decliningBalance(asset: Asset, asOfDate: Date = new Date()): DepreciationResult {
    const purchasePrice = Number(asset.purchasePrice) || 0;
    const purchaseDate = asset.purchaseDate;
    const rate = Number(asset.depreciationRate) || this.DEFAULT_DEPRECIATION_RATE;
    
    if (!purchaseDate || purchasePrice <= 0) {
      return this.getDefaultResult(asset, asOfDate);
    }

    const yearsSincePurchase = this.calculateYearsSincePurchase(purchaseDate, asOfDate);
    let currentValue = purchasePrice;
    let totalDepreciation = 0;

    for (let year = 1; year <= yearsSincePurchase; year++) {
      const annualDepreciation = currentValue * rate;
      totalDepreciation += annualDepreciation;
      currentValue = Math.max(currentValue - annualDepreciation, 0);
    }

    const remainingLife = this.estimateRemainingLife(currentValue, rate);
    const annualDepreciation = currentValue * rate;

    return {
      currentValue,
      totalDepreciation,
      annualDepreciation,
      monthlyDepreciation: annualDepreciation / 12,
      depreciationPercentage: (totalDepreciation / purchasePrice) * 100,
      remainingLife,
      nextDepreciationDate: this.getNextDepreciationDate(purchaseDate, asOfDate),
      method: "Declining Balance",
      calculationDate: asOfDate,
      confidence: 0.85,
      reasoning: `Accelerated depreciation with ${(rate * 100).toFixed(1)}% annual rate`,
    };
  }

  /**
   * Enhanced Double Declining Balance Depreciation
   */
  static doubleDecliningBalance(asset: Asset, asOfDate: Date = new Date()): DepreciationResult {
    const purchasePrice = Number(asset.purchasePrice) || 0;
    const purchaseDate = asset.purchaseDate;
    const lifespan = asset.expectedLifespan || this.DEFAULT_LIFESPAN;
    const rate = (2 / lifespan); // Double the straight line rate
    
    if (!purchaseDate || purchasePrice <= 0) {
      return this.getDefaultResult(asset, asOfDate);
    }

    const yearsSincePurchase = this.calculateYearsSincePurchase(purchaseDate, asOfDate);
    let currentValue = purchasePrice;
    let totalDepreciation = 0;

    for (let year = 1; year <= yearsSincePurchase; year++) {
      const annualDepreciation = currentValue * rate;
      totalDepreciation += annualDepreciation;
      currentValue = Math.max(currentValue - annualDepreciation, 0);
    }

    const remainingLife = Math.max(lifespan - yearsSincePurchase, 0);
    const annualDepreciation = currentValue * rate;

    return {
      currentValue,
      totalDepreciation,
      annualDepreciation,
      monthlyDepreciation: annualDepreciation / 12,
      depreciationPercentage: (totalDepreciation / purchasePrice) * 100,
      remainingLife,
      nextDepreciationDate: this.getNextDepreciationDate(purchaseDate, asOfDate),
      method: "Double Declining Balance",
      calculationDate: asOfDate,
      confidence: 0.8,
      reasoning: `Maximum accelerated depreciation for rapid technology obsolescence`,
    };
  }

  /**
   * Enhanced Auto-Calculation with Market Intelligence
   */
  static autoCalculate(asset: Asset, asOfDate: Date = new Date(), marketConditions?: MarketConditions): DepreciationResult {
    // Hybrid approach: use asset.depreciationMethod if set
    if (asset.depreciationMethod) {
      switch (asset.depreciationMethod) {
        case "straightLine":
          return this.straightLine(asset, asOfDate);
        case "decliningBalance":
          return this.decliningBalance(asset, asOfDate);
        case "doubleDecliningBalance":
          return this.doubleDecliningBalance(asset, asOfDate);
        default:
          // Fallback to auto-selection if unknown value
          break;
      }
    }

    const category = this.getAssetCategory(asset);
    const lifespan = asset.expectedLifespan || this.DEFAULT_LIFESPAN;
    const purchasePrice = Number(asset.purchasePrice) || 0;
    const assetName = asset.name.toLowerCase();
    
    let method: string;
    let confidence: number;
    let reasoning: string;

    // Enhanced method selection logic
    if (this.isTechnologyAsset(category, assetName)) {
      method = "Double Declining Balance";
      confidence = 0.9;
      reasoning = "Technology asset with rapid obsolescence - using accelerated depreciation";
    } else if (this.isVehicleOrMachinery(category, assetName)) {
      method = "Declining Balance";
      confidence = 0.85;
      reasoning = "Vehicle/machinery asset - using declining balance for wear-based depreciation";
    } else if (this.isHighValueAsset(purchasePrice)) {
      method = "Declining Balance";
      confidence = 0.8;
      reasoning = "High-value asset - using declining balance for conservative depreciation";
    } else if (this.isSoftwareOrIntangible(category, assetName)) {
      method = "Double Declining Balance";
      confidence = 0.95;
      reasoning = "Software/intangible asset - maximum accelerated depreciation";
    } else {
      method = "Straight Line";
      confidence = 0.9;
      reasoning = "Standard asset - using straight-line depreciation";
    }

    // Calculate base depreciation
    let result: DepreciationResult;
    switch (method) {
      case "Double Declining Balance":
        result = this.doubleDecliningBalance(asset, asOfDate);
        break;
      case "Declining Balance":
        result = this.decliningBalance(asset, asOfDate);
        break;
      default:
        result = this.straightLine(asset, asOfDate);
    }

    // Apply market adjustments if provided
    if (marketConditions) {
      const marketMultiplier = this.getMarketMultiplier(marketConditions, asset);
      const adjustedAnnualDepreciation = result.annualDepreciation * marketMultiplier;
      
      result = {
        ...result,
        annualDepreciation: adjustedAnnualDepreciation,
        monthlyDepreciation: adjustedAnnualDepreciation / 12,
        marketAdjustments: {
          multiplier: marketMultiplier,
          factors: this.getMarketFactors(marketConditions),
        },
        reasoning: `${reasoning} (Market adjusted: ${(marketMultiplier * 100).toFixed(0)}% of base rate)`,
      };
    } else {
      result.reasoning = reasoning;
    }

    result.confidence = confidence;
    return result;
  }

  /**
   * Enhanced Portfolio Calculation
   */
  static calculatePortfolioDepreciation(assets: Asset[], asOfDate: Date = new Date(), marketConditions?: MarketConditions) {
    if (assets.length === 0) {
      return {
        totalPurchaseValue: 0,
        totalCurrentValue: 0,
        totalDepreciation: 0,
        averageDepreciationRate: 0,
        assetsByDepreciationMethod: {},
        assetsNeedingReplacement: 0,
        portfolioMetrics: {
          totalAssets: 0,
          averageAge: 0,
          averagePurchasePrice: 0,
          averageCurrentValue: 0,
          assetsWithDepreciationData: 0,
          assetsWithoutDepreciationData: 0,
          technologyAssets: 0,
          highValueAssets: 0,
        },
      };
    }

    const results = assets.map(asset => this.autoCalculate(asset, asOfDate, marketConditions));
    
    // Calculate portfolio metrics
    const totalPurchaseValue = assets.reduce((sum, asset) => sum + (Number(asset.purchasePrice) || 0), 0);
    const totalCurrentValue = results.reduce((sum, r) => sum + r.currentValue, 0);
    const totalDepreciation = results.reduce((sum, r) => sum + r.totalDepreciation, 0);
    
    const now = new Date();
    const totalAge = assets.reduce((sum, a) => {
      if (a.purchaseDate) {
        const purchaseDate = new Date(a.purchaseDate);
        const ageInYears = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return sum + ageInYears;
      }
      return sum;
    }, 0);
    const averageAge = totalAge / assets.length;

    const technologyAssets = assets.filter(a => 
      this.isTechnologyAsset(this.getAssetCategory(a), a.name.toLowerCase())
    ).length;

    const highValueAssets = assets.filter(a => 
      Number(a.purchasePrice) >= this.HIGH_VALUE_THRESHOLD
    ).length;

    return {
      totalPurchaseValue,
      totalCurrentValue,
      totalDepreciation,
      averageDepreciationRate: results.length > 0 
        ? results.reduce((sum, r) => sum + r.depreciationPercentage, 0) / results.length 
        : 0,
      assetsByDepreciationMethod: results.reduce((acc, r) => {
        acc[r.method] = (acc[r.method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      assetsNeedingReplacement: results.filter(r => r.remainingLife <= 1).length,
      portfolioMetrics: {
        totalAssets: assets.length,
        averageAge,
        averagePurchasePrice: totalPurchaseValue / assets.length,
        averageCurrentValue: totalCurrentValue / assets.length,
        assetsWithDepreciationData: results.filter(r => r.method !== "No Calculation").length,
        assetsWithoutDepreciationData: results.filter(r => r.method === "No Calculation").length,
        technologyAssets,
        highValueAssets,
      },
    };
  }

  /**
   * Generate enhanced depreciation schedule
   */
  static generateSchedule(
    asset: Asset, 
    method: "straightLine" | "decliningBalance" | "doubleDecliningBalance" = "straightLine",
    asOfDate: Date = new Date(),
    marketConditions?: MarketConditions
  ): DepreciationSchedule[] {
    const purchasePrice = Number(asset.purchasePrice) || 0;
    const purchaseDate = asset.purchaseDate;
    const lifespan = asset.expectedLifespan || this.DEFAULT_LIFESPAN;
    const rate = Number(asset.depreciationRate) || this.DEFAULT_DEPRECIATION_RATE;
    
    if (!purchaseDate || purchasePrice <= 0) {
      return [];
    }

    const marketMultiplier = marketConditions ? this.getMarketMultiplier(marketConditions, asset) : 1;
    const schedule: DepreciationSchedule[] = [];
    let beginningValue = purchasePrice;
    let accumulatedDepreciation = 0;

    for (let year = 1; year <= lifespan; year++) {
      let depreciation = 0;

      switch (method) {
        case "straightLine":
          depreciation = (purchasePrice / lifespan) * marketMultiplier;
          break;
        case "decliningBalance":
          depreciation = beginningValue * rate * marketMultiplier;
          break;
        case "doubleDecliningBalance":
          depreciation = beginningValue * (2 / lifespan) * marketMultiplier;
          break;
      }

      // Ensure we don't depreciate below zero
      depreciation = Math.min(depreciation, beginningValue);
      accumulatedDepreciation += depreciation;
      const endingValue = Math.max(beginningValue - depreciation, 0);

      schedule.push({
        year,
        beginningValue,
        depreciation,
        endingValue,
        accumulatedDepreciation,
        marketValue: endingValue * (marketMultiplier !== 1 ? marketMultiplier : undefined),
      });

      beginningValue = endingValue;
    }

    return schedule;
  }

  // Private helper methods
  private static getAssetCategory(asset: Asset): string {
    if (!asset) return "";
    return ((asset as any).model && (asset as any).model.category && (asset as any).model.category.name ? (asset as any).model.category.name.toLowerCase() : "") ||
           ((asset as any).category && (asset as any).category.name ? (asset as any).category.name.toLowerCase() : "") ||
           (typeof asset.name === "string" ? asset.name.toLowerCase() : "");
  }

  private static isTechnologyAsset(category: string, name: string): boolean {
    const techKeywords = ['computer', 'laptop', 'phone', 'tablet', 'software', 'server', 'network', 'it', 'tech', 'digital'];
    return techKeywords.some(keyword => 
      category.includes(keyword) || name.includes(keyword)
    );
  }

  private static isVehicleOrMachinery(category: string, name: string): boolean {
    const vehicleKeywords = ['vehicle', 'car', 'truck', 'machinery', 'equipment', 'industrial', 'manufacturing'];
    return vehicleKeywords.some(keyword => 
      category.includes(keyword) || name.includes(keyword)
    );
  }

  private static isHighValueAsset(purchasePrice: number): boolean {
    return purchasePrice >= this.HIGH_VALUE_THRESHOLD;
  }

  private static isSoftwareOrIntangible(category: string, name: string): boolean {
    const softwareKeywords = ['software', 'license', 'intangible', 'digital', 'app', 'platform'];
    return softwareKeywords.some(keyword => 
      category.includes(keyword) || name.includes(keyword)
    );
  }

  private static getMarketMultiplier(marketConditions: MarketConditions, asset: Asset): number {
    let multiplier = 1.0;
    const category = this.getAssetCategory(asset);
    const isTech = this.isTechnologyAsset(category, asset.name.toLowerCase());

    // Technology trend impact
    if (marketConditions.technologyTrend === 'accelerating' && isTech) {
      multiplier *= 1.3; // 30% faster depreciation for tech in accelerating market
    } else if (marketConditions.technologyTrend === 'declining' && isTech) {
      multiplier *= 0.8; // 20% slower depreciation for tech in declining market
    }

    // Industry growth impact
    if (marketConditions.industryGrowth === 'high') {
      multiplier *= 1.1; // 10% faster depreciation in high-growth industries
    } else if (marketConditions.industryGrowth === 'low') {
      multiplier *= 0.9; // 10% slower depreciation in low-growth industries
    }

    // Supply chain impact
    if (marketConditions.supplyChainImpact === 'high') {
      multiplier *= 1.2; // 20% faster depreciation due to supply chain issues
    }

    // Economic conditions
    if (marketConditions.economicConditions === 'recession') {
      multiplier *= 0.8; // 20% slower depreciation in recession
    } else if (marketConditions.economicConditions === 'boom') {
      multiplier *= 1.15; // 15% faster depreciation in boom
    }

    return Math.max(0.5, Math.min(2.0, multiplier)); // Clamp between 50% and 200%
  }

  private static getMarketFactors(marketConditions: MarketConditions): string[] {
    const factors: string[] = [];
    
    if (marketConditions.technologyTrend !== 'stable') {
      factors.push(`${marketConditions.technologyTrend} technology trend`);
    }
    if (marketConditions.industryGrowth !== 'medium') {
      factors.push(`${marketConditions.industryGrowth} industry growth`);
    }
    if (marketConditions.supplyChainImpact === 'high') {
      factors.push('supply chain disruption');
    }
    if (marketConditions.economicConditions !== 'stable') {
      factors.push(`${marketConditions.economicConditions} economic conditions`);
    }
    
    return factors;
  }

  private static calculateYearsSincePurchase(purchaseDate: Date, asOfDate: Date): number {
    return (asOfDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  }

  private static getNextDepreciationDate(purchaseDate: Date, asOfDate: Date): Date {
    const nextYear = new Date(purchaseDate);
    nextYear.setFullYear(nextYear.getFullYear() + Math.ceil(this.calculateYearsSincePurchase(purchaseDate, asOfDate)));
    return nextYear;
  }

  private static estimateRemainingLife(currentValue: number, rate: number): number {
    return Math.log(0.01 / currentValue) / Math.log(1 - rate); // Estimate years until 1% of original value
  }

  private static getDefaultResult(asset: Asset, asOfDate: Date): DepreciationResult {
    return {
      currentValue: Number(asset.currentValue) || 0,
      totalDepreciation: 0,
      annualDepreciation: 0,
      monthlyDepreciation: 0,
      depreciationPercentage: 0,
      remainingLife: asset.expectedLifespan || this.DEFAULT_LIFESPAN,
      nextDepreciationDate: asOfDate,
      method: "No Calculation",
      calculationDate: asOfDate,
      confidence: 0,
      reasoning: "Insufficient data for depreciation calculation",
    };
  }
} 