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

// For future migration: swap PLAN_FEATURES with a DB call, keep interface unchanged.
