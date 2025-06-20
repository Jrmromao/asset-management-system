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

async function getAssetUsage(companyId: string): Promise<number> {
  return prisma.asset.count({ where: { companyId } });
}

export async function checkAssetLimit(
  companyId: string,
): Promise<{ allowed: boolean; usage: number; limit: number }> {
  try {
    const subscription = await getCompanySubscription(companyId);

    // The limit is now stored directly on the subscription
    const limit = subscription.assetQuota;
    const usage = await getAssetUsage(companyId);

    return {
      allowed: usage < limit,
      usage,
      limit,
    };
  } catch (error) {
    console.error(`Error checking asset limit:`, error);
    // Default to a higher limit for development if subscription fails
    return { allowed: true, usage: 0, limit: 100 };
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
