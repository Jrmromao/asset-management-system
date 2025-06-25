import { prisma } from "@/app/db";

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
    const limit = subscription.assetQuota;
    const usage = await getItemUsage(companyId);

    return {
      allowed: usage.total < limit,
      usage,
      limit,
      remaining: Math.max(0, limit - usage.total),
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
    const features = subscription.pricingPlan.features as string[];
    return features.includes(feature);
  } catch (error) {
    console.error(`Error checking feature "${feature}":`, error);
    return false;
  }
}
