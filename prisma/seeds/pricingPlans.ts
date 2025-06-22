import { PlanType, PrismaClient } from "@prisma/client";

export async function seedPricingPlans(prisma: PrismaClient) {
  console.log("💰 Seeding pricing plans...");

  const pricingPlans = [
    {
      name: "Free",
      planType: "FREE",
      assetQuota: 10,
      pricePerAsset: 0,
      billingCycle: "monthly",
      stripePriceId: null,
      features: JSON.stringify([
        "Up to 10 assets",
        "Basic reporting",
        "Community support",
      ]),
    },
    {
      name: "Pro",
      planType: "PRO",
      assetQuota: 100,
      pricePerAsset: 0.39,
      billingCycle: "monthly",
      stripePriceId: "price_1QlZyQ2N5SBY44N5l2hElB14",
      features: JSON.stringify([
        "Up to 100,000 assets",
        "Advanced reporting",
        "Email support",
      ]),
    },
    {
      name: "Enterprise",
      planType: "ENTERPRISE",
      assetQuota: 10000,
      pricePerAsset: 0.29,
      billingCycle: "monthly",
      stripePriceId: "price_1QlZyQ2N5SBY44N5l2hElB15",
      features: JSON.stringify([
        "Unlimited assets",
        "Advanced reporting",
        "Priority support",
        "Custom integrations",
      ]),
    },
  ];

  const createdPlans = [];
  for (const plan of pricingPlans) {
    const created = await prisma.pricingPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: {
        ...plan,
        planType: plan.planType as PlanType,
        stripePriceId: plan.stripePriceId || "",
      },
    });
    createdPlans.push(created);
    console.log(`✅ Created pricing plan: ${created.name}`);
  }

  return createdPlans;
} 