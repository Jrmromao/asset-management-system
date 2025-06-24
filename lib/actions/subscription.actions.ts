"use server";

import { prisma } from "@/app/db";
import Stripe from "stripe";
import { PlanType } from "@prisma/client";

// Validate required environment variables
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} environment variable is not set.`);
  }
});

const stripe = new Stripe(requiredEnvVars.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

interface SubscriptionResponse {
  success: boolean;
  url?: string;
  sessionId?: string;
  error?: string;
}

// Main subscription creation function
export async function createSubscription(
  companyId: string,
  email: string,
  assetQuota: number,
): Promise<{ success: boolean; url?: string | null; error?: string }> {
  try {
    // Find the appropriate plan based on asset quota
    let plan = await prisma.pricingPlan.findFirst({
      where: {
        isActive: true,
        assetQuota: { gte: assetQuota },
      },
      orderBy: { assetQuota: "asc" },
    });

    // If no plan found, get the free plan
    if (!plan) {
      plan = await prisma.pricingPlan.findFirst({
        where: {
          isActive: true,
          planType: "FREE",
        },
      });
    }

    if (!plan) {
      return { success: false, error: "No suitable pricing plan found." };
    }

    // Handle free plan - create subscription directly without Stripe
    if (
      plan.planType === "FREE" ||
      plan.stripePriceId?.includes("placeholder")
    ) {
      try {
        const subscription = await prisma.subscription.create({
          data: {
            companyId,
            stripeCustomerId: `free_${companyId}`, // Placeholder for free plan
            stripeSubscriptionId: `free_sub_${companyId}`,
            status: "active",
            billingCycle: plan.billingCycle,
            assetQuota: plan.assetQuota,
            pricingPlanId: plan.id,
          },
        });

        // Create usage record for free plan
        await prisma.usageRecord.create({
          data: {
            subscriptionId: subscription.id,
            purchasedAssetQuota: plan.assetQuota,
            actualAssetCount: 0,
            billingPeriodStart: new Date(),
            billingPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            pricePerAsset: plan.pricePerAsset,
            totalAmount: 0,
          },
        });

        return { success: true, url: null }; // No redirect needed for free plan
      } catch (error) {
        console.error("Error creating free subscription:", error);
        return {
          success: false,
          error: "Failed to create free subscription",
        };
      }
    }

    // Handle paid plans - create Stripe checkout session
    if (!plan.stripePriceId) {
      return { success: false, error: "Pricing plan missing Stripe price ID." };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
      customer_email: email,
      subscription_data: {
        trial_period_days: plan.trialDays || 0,
        metadata: {
          companyId: companyId,
          assetCount: assetQuota.toString(),
          planId: plan.id,
        },
      },
      metadata: {
        companyId: companyId,
        assetCount: assetQuota.toString(),
        planId: plan.id,
      },
    });

    if (!session.url) {
      return {
        success: false,
        error: "Could not create a checkout session.",
      };
    }

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Webhook handler for completed checkout
export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log("Handling checkout complete for session:", session.id);
  if (!session.subscription || !session.customer || !session.metadata) {
    console.error("Invalid checkout session:", session);
    throw new Error("Invalid checkout session");
  }

  const { companyId, assetCount, planId } = session.metadata;
  console.log("Checkout metadata:", { companyId, assetCount, planId });

  if (!companyId || !assetCount || !planId) {
    console.error(
      "Missing required metadata in checkout session:",
      session.metadata,
    );
    throw new Error("Missing required metadata in checkout session.");
  }

  const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error("Pricing plan not found for ID:", planId);
    throw new Error("Pricing plan not found.");
  }
  console.log("Found pricing plan:", plan.id);

  return prisma.$transaction(async (tx) => {
    console.log(
      "Starting transaction to create subscription and usage record.",
    );
    // Create subscription record
    const subscription = await tx.subscription.create({
      data: {
        companyId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        status: "trialing",
        billingCycle: plan.billingCycle,
        assetQuota: parseInt(assetCount, 10),
        trialEndsAt: new Date(
          Date.now() + plan.trialDays * 24 * 60 * 60 * 1000,
        ),
        pricingPlanId: plan.id,
      },
    });
    console.log("Subscription record created:", subscription.id);

    // Create usage record
    await tx.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        purchasedAssetQuota: parseInt(assetCount, 10),
        actualAssetCount: 0, // Starts at 0
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(
          Date.now() + plan.trialDays * 24 * 60 * 60 * 1000,
        ),
        pricePerAsset: plan.pricePerAsset,
        totalAmount: 0,
      },
    });
    console.log("Usage record created for subscription:", subscription.id);

    console.log("Transaction completed successfully.");
    return subscription;
  });
}

// Handle trial end
export const handleTrialEnd = async (subscriptionId: string) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    return await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "active",
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error handling trial end:", error);
    throw error;
  }
};

// Add subscription usage tracking
export const updateUsageRecord = async (
  subscriptionId: string,
  actualAssetCount: number,
) => {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: { pricingPlan: true },
  });

  if (!subscription || !subscription.pricingPlan) {
    throw new Error("Subscription or pricing plan not found");
  }

  // Update usage in Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const subscriptionItems = await stripe.subscriptionItems.list({
    subscription: subscription.stripeSubscriptionId,
    limit: 1,
  });

  if (!subscriptionItems.data.length) {
    throw new Error("Subscription item not found.");
  }

  await stripe.subscriptionItems.createUsageRecord(
    subscriptionItems.data[0].id,
    {
      quantity: actualAssetCount,
      timestamp: Math.floor(Date.now() / 1000),
      action: "set",
    },
  );

  // Update local usage record
  await prisma.usageRecord.create({
    data: {
      subscriptionId: subscription.id,
      purchasedAssetQuota: subscription.assetQuota,
      actualAssetCount,
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(),
      pricePerAsset: subscription.pricingPlan.pricePerAsset,
      totalAmount:
        Number(subscription.pricingPlan.pricePerAsset) * actualAssetCount,
    },
  });
};

export async function updateAssetQuota(
  companyId: string,
  newAssetQuota: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      throw new Error("Subscription not found.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Get the first subscription item (assuming one item per subscription)
    const subscriptionItems = await stripe.subscriptionItems.list({
      subscription: subscription.stripeSubscriptionId,
      limit: 1,
    });

    if (!subscriptionItems.data.length) {
      throw new Error("Subscription item not found.");
    }

    // Update the quantity of the subscription item
    await stripe.subscriptionItems.update(subscriptionItems.data[0].id, {
      quantity: newAssetQuota,
    });

    // Update the asset quota in your database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { assetQuota: newAssetQuota },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to update asset quota:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
