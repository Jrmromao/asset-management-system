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
export const createSubscription = async (
  companyId: string,
  email: string,
  assetCount: number,
): Promise<SubscriptionResponse> => {
  try {
    // Find or create the Stripe customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    let customer: Stripe.Customer;
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Optionally, update metadata if needed
      await stripe.customers.update(customer.id, {
        metadata: { companyId },
      });
    } else {
      customer = await stripe.customers.create({
        email,
        metadata: { companyId },
      });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: requiredEnvVars.STRIPE_PRICE_ID!,
          quantity: assetCount, // Dynamically set asset count
        },
      ],
      subscription_data: {
        trial_period_days: 30, // Consistent with stripe.actions.ts
        metadata: { assetQuota: assetCount, companyId }, // Keep metadata consistent
      },
      metadata: { companyId, assetCount: assetCount.toString() },
      success_url: `${requiredEnvVars.NEXT_PUBLIC_APP_URL}/account-verification?email=${email}&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${requiredEnvVars.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    return {
      success: true,
      url: session.url ?? "",
      sessionId: session.id,
    };
  } catch (error) {
    console.error("Subscription creation error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create subscription",
    };
  }
};

// Webhook handler for completed checkout
export async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.customer || !session.metadata) {
    throw new Error("Invalid checkout session");
  }

  const { companyId, assetCount, planId } = session.metadata;

  if (!companyId || !assetCount || !planId) {
    throw new Error("Missing required metadata in checkout session.");
  }

  const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    throw new Error("Pricing plan not found.");
  }

  return prisma.$transaction(async (tx) => {
    // Create subscription record
    const subscription = await tx.subscription.create({
      data: {
        companyId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        status: "trialing",
        billingCycle: plan.billingCycle,
        assetQuota: parseInt(assetCount, 10),
        trialEndsAt: new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000),
        pricingPlanId: plan.id,
      },
    });

    // Create usage record
    await tx.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        purchasedAssetQuota: parseInt(assetCount, 10),
        actualAssetCount: 0, // Starts at 0
        billingPeriodStart: new Date(),
        billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pricePerAsset: plan.pricePerAsset,
        totalAmount: 0,
      },
    });

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
  actualAssetCount: number
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
        error instanceof Error
          ? error.message
          : "An unknown error occurred",
    };
  }
}
