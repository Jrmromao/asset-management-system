"use server";

import { prisma } from "@/app/db";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
  throw new Error("Missing required Stripe environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { companyId },
    });

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: assetCount, // Dynamically set asset count
        },
      ],
      subscription_data: {
        trial_period_days: 15, // Optional: Adjust as needed
        metadata: { assetQuota: assetCount }, // Keep metadata consistent
      },
      metadata: { companyId, assetCount },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account-verification?email=${email}&success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
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
  if (!session.subscription || !session.customer) {
    throw new Error("Invalid checkout session");
  }

  const { companyId, assetCount } = session.metadata as {
    companyId: string;
    assetCount: string;
  };

  return prisma.$transaction(async (tx) => {
    // Create subscription record
    const subscription = await tx.subscription.create({
      data: {
        companyId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        stripePriceId: process.env.STRIPE_PRICE_ID!,
        status: "TRIAL",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        pricePerAsset: 0.5,
        plan: "FREE",
        billingCycleAnchor: new Date(),
      },
    });

    // Create usage record
    await tx.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        purchasedAssetQuota: Number(assetCount),
        actualAssetCount: Number(assetCount),
        billingPeriodStart: subscription.currentPeriodStart,
        billingPeriodEnd: subscription.currentPeriodEnd,
        pricePerAsset: subscription.pricePerAsset,
        totalAmount: Number(subscription.pricePerAsset) * Number(assetCount),
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
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error handling trial end:", error);
    throw error;
  }
};
