import { PlanType, PrismaClient } from "@prisma/client";

export async function seedPricingPlans(prisma: PrismaClient) {
  console.log("💰 Seeding pricing plans...");

  const pricingPlans = [
    {
      name: "Free",
      planType: "FREE" as PlanType,
      assetQuota: 10,
      pricePerAsset: 0,
      billingCycle: "monthly",
      stripePriceId: "free_plan_placeholder",
      features: JSON.stringify([
        "Up to 10 assets",
        "Basic reporting",
        "Community support",
      ]),
    },
    {
      name: "Pro",
      planType: "PRO" as PlanType,
      assetQuota: 100,
      pricePerAsset: 0.39,
      billingCycle: "monthly",
      stripePriceId: "pro_plan_placeholder",
      features: JSON.stringify([
        "Up to 100 assets",
        "Advanced reporting",
        "Priority support",
        "Custom fields",
        "API access",
      ]),
    },
    {
      name: "Enterprise",
      planType: "ENTERPRISE" as PlanType,
      assetQuota: 1000,
      pricePerAsset: 0.29,
      billingCycle: "monthly",
      stripePriceId: "enterprise_plan_placeholder",
      features: JSON.stringify([
        "Up to 1000 assets",
        "Advanced analytics",
        "Dedicated support",
        "Custom integrations",
        "White-label options",
        "SLA guarantee",
      ]),
    },
  ];

  const createdPlans = [];
  for (const plan of pricingPlans) {
    const existing = await prisma.pricingPlan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      console.log(`⚠️  Pricing plan already exists: ${existing.name}`);
      continue;
    }

    const created = await prisma.pricingPlan.create({
      data: plan,
    });

    createdPlans.push(created);
    console.log(
      `✅ Created pricing plan: ${created.name} (${created.stripePriceId || "Free"})`,
    );
  }

  console.log(`💰 Successfully created ${createdPlans.length} pricing plans`);
  return createdPlans;
}
