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
  apiVersion: "2024-06-20",
});

// Retry logic with exponential backoff
async function handleWebhookWithRetry(
  eventType: string,
  handler: () => Promise<void>,
  maxRetries = 3,
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
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000),
      );
    }
  }
}

export async function POST(req: Request) {
  if (
    !requiredEnvVars.STRIPE_SECRET_KEY ||
    !requiredEnvVars.STRIPE_WEBHOOK_SECRET
  ) {
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
      objectId: "id" in event.data.object ? event.data.object.id : "unknown",
      timestamp: new Date(event.created * 1000).toISOString(),
    });

    switch (event.type) {
      case "customer.subscription.trial_will_end":
        await handleWebhookWithRetry(event.type, () =>
          handleTrialEnding(event.data.object as Stripe.Subscription),
        );
        break;

      case "checkout.session.completed":
        await handleWebhookWithRetry(event.type, () =>
          handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session),
        );
        break;

      case "invoice.paid":
        await handleWebhookWithRetry(event.type, () =>
          handleInvoicePaid(event.data.object as Stripe.Invoice),
        );
        break;

      case "invoice.payment_failed":
        await handleWebhookWithRetry(event.type, () =>
          handlePaymentFailed(event.data.object as Stripe.Invoice),
        );
        break;

      case "customer.subscription.deleted":
        await handleWebhookWithRetry(event.type, () =>
          handleSubscriptionDeleted(event.data.object as Stripe.Subscription),
        );
        break;

      case "customer.subscription.updated":
        await handleWebhookWithRetry(event.type, () =>
          handleSubscriptionUpdated(event.data.object as Stripe.Subscription),
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
  if (!["active", "trialing"].includes(subscription.status)) {
    console.warn(
      `Skipping trial ending for subscription ${subscription.id} with status: ${subscription.status}`,
    );
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
    const subscriptionId = invoice.subscription as string;

    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionId },
      });

      if (subscription) {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { status: "active" },
        });
        console.log(`Subscription ${subscriptionId} updated to active.`);
      } else {
        console.warn(
          `Subscription ${subscriptionId} not found in DB. Creating from Stripe invoice.`,
        );

        const stripeSubscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const { companyId, assetQuota, planId } = stripeSubscription.metadata;

        if (!companyId || !assetQuota || !planId) {
          throw new Error(
            `Missing required metadata in subscription ${subscriptionId} from Stripe.`,
          );
        }

        const plan = await tx.pricingPlan.findUnique({
          where: { id: planId },
        });
        if (!plan) {
          throw new Error(`Pricing plan with ID ${planId} not found.`);
        }

        await tx.subscription.create({
          data: {
            companyId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: stripeSubscription.customer as string,
            status: "active",
            billingCycle: plan.billingCycle,
            assetQuota: parseInt(assetQuota, 10),
            trialEndsAt: stripeSubscription.trial_end
              ? new Date(stripeSubscription.trial_end * 1000)
              : null,
            pricingPlanId: plan.id,
          },
        });

        await tx.company.update({
          where: { id: companyId },
          data: { status: CompanyStatus.ACTIVE },
        });

        console.log(
          `Successfully created subscription ${subscriptionId} from invoice.paid webhook.`,
        );
      }
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
    await tx.subscription.updateMany({
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
  // 1. Validate required data is present
  const subscriptionFromSession = session.subscription;
  if (!subscriptionFromSession) {
    throw new Error("No subscription ID found in checkout session.");
  }
  const subscriptionId =
    typeof subscriptionFromSession === "string"
      ? subscriptionFromSession
      : subscriptionFromSession.id;

  const customerId = session.customer;
  if (!customerId || typeof customerId !== "string") {
    throw new Error("No customer ID found in checkout session.");
  }

  const { companyId, assetCount, planId } = session.metadata || {};
  if (!companyId || !assetCount || !planId) {
    throw new Error("Missing required metadata in checkout session.");
  }

  // 2. Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // 3. Check if subscription already exists to prevent duplicates
    const existingSubscription = await tx.subscription.findUnique({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (existingSubscription) {
      console.log(`Subscription ${subscriptionId} already exists. Skipping.`);
      return;
    }

    // 4. Find the pricing plan
    const plan = await tx.pricingPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new Error(`Pricing plan with ID ${planId} not found.`);
    }

    // 5. Create the subscription record
    await tx.subscription.create({
      data: {
        companyId,
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        status: plan.trialDays > 0 ? "trialing" : "active",
        billingCycle: plan.billingCycle,
        assetQuota: parseInt(assetCount, 10),
        trialEndsAt:
          plan.trialDays > 0
            ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000)
            : null,
        pricingPlanId: plan.id,
      },
    });

    // 6. Activate the company
    await tx.company.update({
      where: { id: companyId },
      data: { status: CompanyStatus.ACTIVE },
    });

    console.log(
      `Successfully created subscription ${subscriptionId} for company ${companyId}.`,
    );
  });
}
