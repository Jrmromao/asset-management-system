import { prisma } from "@/app/db";
import {
  PlanType as StaticPlanType,
  hasFeature as staticHasFeature,
  FeatureType,
  getPlanLimits,
} from "@/lib/services/plan-features.service";

async function getCompanySubscription(companyId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { companyId },
    include: {
      pricingPlan: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found for company.");
  }

  return subscription;
}

async function getItemUsage(companyId: string): Promise<{
  total: number;
  assets: number;
  licenses: number;
  accessories: number;
}> {
  const [assets, licenses, accessories] = await Promise.all([
    prisma.asset.count({ where: { companyId } }),
    prisma.license.count({ where: { companyId } }),
    prisma.accessory.count({ where: { companyId } }),
  ]);

  return {
    total: assets + licenses + accessories,
    assets,
    licenses,
    accessories,
  };
}

export async function getActiveUserCount(companyId: string): Promise<number> {
  // Only count users who are active and have completed registration
  return prisma.user.count({
    where: {
      companyId,
      active: true,
      status: "ACTIVE", // Only users who have completed registration
    },
  });
}

export async function canAddActiveUser(
  companyId: string,
): Promise<{ allowed: boolean; limit: number; used: number }> {
  let planType: string | undefined;
  let staticPlanType: StaticPlanType | undefined;
  try {
    const subscription = await getCompanySubscription(companyId);
    planType = subscription.pricingPlan?.planType?.toLowerCase?.();
    // Log for debugging
    console.log("[canAddActiveUser] planType:", planType);
    staticPlanType = Object.values(StaticPlanType).find(
      (p) => p === planType,
    ) as StaticPlanType | undefined;
    console.log("[canAddActiveUser] staticPlanType:", staticPlanType);
  } catch (e) {
    console.warn("[canAddActiveUser] Subscription lookup failed:", e);
  }
  // Fallback to Starter plan if planType is missing or invalid
  if (!staticPlanType) {
    staticPlanType = StaticPlanType.Starter;
    planType = "starter";
  }
  const { activeUserLimit } = getPlanLimits(staticPlanType);
  const used = await getActiveUserCount(companyId);
  return { allowed: used < activeUserLimit, limit: activeUserLimit, used };
}

// Update checkItemLimit to use itemLimit from plan limits
export async function checkItemLimit(companyId: string): Promise<{
  allowed: boolean;
  usage: {
    total: number;
    assets: number;
    licenses: number;
    accessories: number;
  };
  limit: number;
  remaining: number;
}> {
  try {
    const subscription = await getCompanySubscription(companyId);
    const planType = subscription.pricingPlan?.planType?.toLowerCase?.();
    if (!planType) throw new Error("No plan type");
    const staticPlanType = Object.values(StaticPlanType).find(
      (p) => p === planType,
    ) as StaticPlanType | undefined;
    if (!staticPlanType) throw new Error("No static plan type");
    const { itemLimit } = getPlanLimits(staticPlanType);
    const usage = await getItemUsage(companyId);

    return {
      allowed: usage.total < itemLimit,
      usage,
      limit: itemLimit,
      remaining: Math.max(0, itemLimit - usage.total),
    };
  } catch (error) {
    console.error(`Error checking item limit:`, error);
    return {
      allowed: true,
      usage: { total: 0, assets: 0, licenses: 0, accessories: 0 },
      limit: 100,
      remaining: 100,
    };
  }
}

export async function checkAssetLimit(
  companyId: string,
): Promise<{ allowed: boolean; usage: number; limit: number }> {
  const result = await checkItemLimit(companyId);
  return {
    allowed: result.allowed,
    usage: result.usage.total,
    limit: result.limit,
  };
}

export async function getQuotaInfo(companyId: string): Promise<{
  success: boolean;
  data?: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    breakdown: {
      assets: number;
      licenses: number;
      accessories: number;
    };
  };
  error?: string;
}> {
  try {
    const result = await checkItemLimit(companyId);

    return {
      success: true,
      data: {
        used: result.usage.total,
        limit: result.limit,
        remaining: result.remaining,
        percentage: Math.round((result.usage.total / result.limit) * 100),
        breakdown: {
          assets: result.usage.assets,
          licenses: result.usage.licenses,
          accessories: result.usage.accessories,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get quota info",
    };
  }
}

export async function hasFeature(
  companyId: string,
  feature: string,
): Promise<boolean> {
  try {
    const subscription = await getCompanySubscription(companyId);
    if (!subscription.pricingPlan) {
      return false;
    }
    // Use static plan-feature mapping for MVP
    const planType = subscription.pricingPlan.planType?.toLowerCase?.();
    if (!planType) return false;
    // Type assertion: convert DB planType to static PlanType enum
    const staticPlanType = Object.values(StaticPlanType).find(
      (p) => p === planType,
    ) as StaticPlanType | undefined;
    if (!staticPlanType) return false;
    // Convert string to FeatureType enum
    const featureEnum = (Object.values(FeatureType) as string[]).includes(
      feature,
    )
      ? (feature as FeatureType)
      : undefined;
    if (!featureEnum) return false;
    return staticHasFeature(staticPlanType, featureEnum);
    // For future migration: fallback to DB features array if needed
    // const features = subscription.pricingPlan.features as string[];
    // return features.includes(feature);
  } catch (error) {
    console.error(`Error checking feature "${feature}":`, error);
    return false;
  }
}
