import Stripe from "stripe";
import { prisma } from "@/app/db";
import { CompanyStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// Validate required environment variables
const requiredEnvVars = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
  STRIPE_PRICE_ID_BUSINESS: process.env.STRIPE_PRICE_ID_BUSINESS,
} as const;

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.warn(`${key} environment variable is not set.`);
  }
});

const stripe = new Stripe(requiredEnvVars.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Retry logic with exponential backoff
async function handleWebhookWithRetry(
  eventType: string,
  handler: () => Promise<void>,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await handler();
      return;
    } catch (error) {
      console.error(`Webhook ${eventType} attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}

export async function POST(req: Request) {
  if (!requiredEnvVars.STRIPE_SECRET_KEY || !requiredEnvVars.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing required environment variables");
    return new Response("Server configuration error", { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      requiredEnvVars.STRIPE_WEBHOOK_SECRET!,
    );

    console.log(`Processing webhook event: ${event.type}`, {
      eventId: event.id,
      objectId: 'id' in event.data.object ? event.data.object.id : 'unknown',
      timestamp: new Date(event.created * 1000).toISOString(),
    });

    switch (event.type) {
      case "customer.subscription.trial_will_end":
        await handleWebhookWithRetry(
          event.type,
          () => handleTrialEnding(event.data.object as Stripe.Subscription)
        );
        break;

      case "checkout.session.completed":
        await handleWebhookWithRetry(
          event.type,
          () => handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        );
        break;

      case "invoice.paid":
        await handleWebhookWithRetry(
          event.type,
          () => handleInvoicePaid(event.data.object as Stripe.Invoice)
        );
        break;

      case "invoice.payment_failed":
        await handleWebhookWithRetry(
          event.type,
          () => handlePaymentFailed(event.data.object as Stripe.Invoice)
        );
        break;

      case "customer.subscription.deleted":
        await handleWebhookWithRetry(
          event.type,
          () => handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        );
        break;

      case "customer.subscription.updated":
        await handleWebhookWithRetry(
          event.type,
          () => handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log(`Successfully processed webhook event: ${event.type}`);
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`,
      { status: 400 },
    );
  }
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  // Validate subscription status
  if (!['active', 'trialing'].includes(subscription.status)) {
    console.warn(`Skipping trial ending for subscription ${subscription.id} with status: ${subscription.status}`);
    return;
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: "trial_ending",
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: "active",
      },
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (invoice.subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        status: "past_due",
      },
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: "canceled",
        cancelAtPeriodEnd: true,
      },
    });
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { companyId, assetQuota, planId } = session.metadata as {
    companyId: string;
    assetQuota: string;
    planId: string;
  };

  if (!companyId || !assetQuota || !planId) {
    console.error("Missing required metadata in checkout session");
    return;
  }

  const subscriptionId = session.subscription as string;
  if (!subscriptionId) {
    console.error("No subscription ID found in checkout session");
    return;
  }

  const plan = await prisma.pricingPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error(`Pricing plan with ID ${planId} not found.`);
    return;
  }

  await prisma.subscription.create({
    data: {
      companyId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: session.customer as string,
      status: "trialing",
      billingCycle: plan.billingCycle,
      assetQuota: parseInt(assetQuota, 10),
      trialEndsAt: new Date(
        Date.now() + (plan.trialDays || 0) * 24 * 60 * 60 * 1000,
      ),
      pricingPlanId: plan.id,
    },
  });

  await prisma.company.update({
    where: { id: companyId },
    data: { status: CompanyStatus.ACTIVE },
  });
}
