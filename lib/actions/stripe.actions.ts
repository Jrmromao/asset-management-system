"use server";

import Stripe from "stripe";
import { prisma } from "@/app/db";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

// Validate all required environment variables
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
} as const;

// Type-safe validation
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} environment variable is not set.`);
  }
});

// Type assertion after validation
const stripe = new Stripe(requiredEnvVars.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

interface CheckoutSessionResponse {
  success: boolean;
  session?: Stripe.Checkout.Session;
  error?: string;
}

export async function createCheckoutSession({
  email,
  assetCount,
  companyId,
  billingCycle, // "monthly" or "yearly"
}: {
  email: string;
  assetCount: number;
  companyId: string;
  billingCycle: string;
}): Promise<CheckoutSessionResponse> {
  try {
    const plan = await prisma.pricingPlan.findFirst({
      where: {
        billingCycle,
        isActive: true,
      },
    });

    if (!plan) {
      throw new Error(`No active ${billingCycle} plan found.`);
    }

    const customer = await stripe.customers.create({
      email,
      metadata: { companyId },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: assetCount,
        },
      ],
      subscription_data: {
        trial_period_days: plan.trialDays,
        metadata: {
          companyId,
          assetQuota: assetCount,
          planId: plan.id,
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/onboarding-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/`,
    });

    await createAuditLog({
      companyId,
      action: "CHECKOUT_SESSION_CREATED",
      entity: "STRIPE_CHECKOUT",
      entityId: session.id,
      details: `Stripe checkout session created for ${email} (assets: ${assetCount}, billing: ${billingCycle})`,
    });

    return { success: true, session };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout session",
    };
  }
}
