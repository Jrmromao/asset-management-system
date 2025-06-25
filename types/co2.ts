// GHG Scope Classifications
export interface GHGScopeBreakdown {
  scope1: {
    total: number;
    categories: {
      stationaryCombustion?: number;
      mobileCombustion?: number;
      processEmissions?: number;
      fugitiveEmissions?: number;
    };
  };
  scope2: {
    total: number;
    locationBased: number;
    marketBased: number;
    electricity: number;
    heating?: number;
    cooling?: number;
    steam?: number;
  };
  scope3: {
    total: number;
    categories: {
      purchasedGoods?: number; // Category 1
      capitalGoods?: number; // Category 2
      fuelEnergyActivities?: number; // Category 3
      upstreamTransport?: number; // Category 4
      wasteGenerated?: number; // Category 5
      businessTravel?: number; // Category 6
      employeeCommuting?: number; // Category 7
      upstreamAssets?: number; // Category 8
      downstreamTransport?: number; // Category 9
      processingProducts?: number; // Category 10
      useOfProducts?: number; // Category 11
      endOfLifeTreatment?: number; // Category 12
      downstreamAssets?: number; // Category 13
      franchises?: number; // Category 14
      investments?: number; // Category 15
    };
  };
}

export interface EmissionFactorSource {
  name: string;
  version: string;
  url?: string;
  region?: string;
  lastUpdated?: string;
}

export interface CO2CalculationResult {
  totalCo2e: number;
  units: string;
  confidenceScore: number;

  // Enhanced lifecycle breakdown
  lifecycleBreakdown: {
    manufacturing: number | "N/A";
    transport: number | "N/A";
    use: number | "N/A";
    endOfLife: number | "N/A";
  };

  // Direct DB lifecycle fields (optional)
  lifecycleManufacturing?: number | "N/A";
  lifecycleTransport?: number | "N/A";
  lifecycleUse?: number | "N/A";
  lifecycleEndOfLife?: number | "N/A";

  // New GHG Scope breakdown
  scopeBreakdown: GHGScopeBreakdown;

  // Primary scope classification for this asset
  primaryScope: 1 | 2 | 3;
  primaryScopeCategory: string;

  // Enhanced source tracking
  sources: Array<{ name: string; url: string }>;
  emissionFactors: EmissionFactorSource[];

  description: string;
  methodology: string;

  // Activity data used for calculation
  activityData?: {
    energyConsumption?: number; // kWh/year
    weight?: number; // kg
    expectedLifespan?: number; // years
    transportDistance?: number; // km
    [key: string]: any;
  };

  // --- Amortized and lifespan fields ---
  amortizedMonthlyCo2e?: number;
  amortizedAnnualCo2e?: number;
  expectedLifespanYears?: number;
}
