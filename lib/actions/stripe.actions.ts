"use server";

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set.");
}

const stripe = new Stripe(stripeSecretKey, {
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
}: {
  email: string;
  assetCount: number;
  companyId: string;
}): Promise<CheckoutSessionResponse> {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1QlZyQ2N5SBY44N5l2hElB14", // Verify this price ID
          quantity: assetCount,
          adjustable_quantity: {
            enabled: true,
            minimum: 100,
            maximum: 5000,
          },
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          assetCount: assetCount.toString(),
          companyId,
        },
      },
      metadata: {
        companyId,
      },
      success_url: `${process.env.NEXTAUTH_URL}/account-verification?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/`,
      customer_email: email,
    });

    console.log("Session created successfully:", session.id);
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
