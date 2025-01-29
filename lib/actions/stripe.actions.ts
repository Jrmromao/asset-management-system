"use server";

import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ||
    "sk_test_51PifCH2N5SBY44N5QTQZWyJn8oxmCVaYkWDUWXGmr5Yp2fmlwWo4SUKtpai2tC2ku8TkJ9Y3FBrLyeMQM7ufS8pE00rJwIf2bW",
  {
    apiVersion: "2024-12-18.acacia",
  },
);

interface CheckoutSessionResponse {
  success: boolean;
  session?: Stripe.Checkout.Session;
  error?: string;
}

export async function createCheckoutSession({
  email = "jrmromao@gmail.com",
  assetCount = 200,
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
          quantity: 1000,
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
          assetCount: assetCount.toString(), // Convert to string for metadata
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
    throw error;

    // Check for specific Stripe errors
    // if (error instanceof Stripe.errors.StripeError) {
    //   return {
    //     success: false,
    //     error: error.message,
    //   };
    // }

    // return {
    //   success: false,
    //   error:
    //     error instanceof Error
    //       ? error.message
    //       : "Failed to create checkout session",
    // };
  }
}
