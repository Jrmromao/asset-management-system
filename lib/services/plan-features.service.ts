// Plan and feature types for type safety and future extensibility
export enum PlanType {
  Starter = "starter",
  Professional = "professional",
  Enterprise = "enterprise",
}

export enum FeatureType {
  AssetManagement = "asset-management",
  LicenseManagement = "license-management",
  MaintenanceTracking = "maintenance-tracking",
  AIAnalytics = "ai-analytics",
  CO2Tracking = "co2-tracking",
  MultiTenancy = "multi-tenancy",
  AdvancedReporting = "advanced-reporting",
  APIAccess = "api-access",
  CustomBranding = "custom-branding",
  PrioritySupport = "priority-support",
  // Add more features as needed
}

// Static mapping of plans to features (MVP)
const PLAN_FEATURES: Record<PlanType, FeatureType[]> = {
  [PlanType.Starter]: [
    FeatureType.AssetManagement,
    FeatureType.LicenseManagement,
    FeatureType.MaintenanceTracking,
    // Add only features available in Starter
  ],
  [PlanType.Professional]: [
    FeatureType.AssetManagement,
    FeatureType.LicenseManagement,
    FeatureType.MaintenanceTracking,
    FeatureType.AIAnalytics,
    FeatureType.CO2Tracking,
    FeatureType.AdvancedReporting,
    // Add only features available in Professional
  ],
  [PlanType.Enterprise]: [
    FeatureType.AssetManagement,
    FeatureType.LicenseManagement,
    FeatureType.MaintenanceTracking,
    FeatureType.AIAnalytics,
    FeatureType.CO2Tracking,
    FeatureType.MultiTenancy,
    FeatureType.AdvancedReporting,
    FeatureType.APIAccess,
    FeatureType.CustomBranding,
    FeatureType.PrioritySupport,
    // Add all features for Enterprise
  ],
};

// Get all features for a given plan
export function getFeaturesForPlan(plan: PlanType): FeatureType[] {
  return PLAN_FEATURES[plan] || [];
}

// Check if a plan includes a specific feature
export function hasFeature(plan: PlanType, feature: FeatureType): boolean {
  return PLAN_FEATURES[plan]?.includes(feature) ?? false;
}

// Plan limits for each plan
export type PlanLimits = {
  itemLimit: number;
  activeUserLimit: number;
  overagePerItem: number;
};

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  [PlanType.Starter]: {
    itemLimit: 100,
    activeUserLimit: 3,
    overagePerItem: 0.25,
  },
  [PlanType.Professional]: {
    itemLimit: 1000,
    activeUserLimit: 10,
    overagePerItem: 0.1,
  },
  [PlanType.Enterprise]: {
    itemLimit: 10000,
    activeUserLimit: 100,
    overagePerItem: 0.05,
  }, // Example enterprise
};

export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan];
}

// For future migration: swap PLAN_FEATURES with a DB call, keep interface unchanged.
