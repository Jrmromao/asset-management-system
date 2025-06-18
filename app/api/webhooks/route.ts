import Stripe from "stripe";
import { prisma } from "@/app/db";
import { CompanyStatus, PlanType } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
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
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (event.type) {
      case "customer.subscription.trial_will_end":
        const trialEndEvent = event.data.object as Stripe.Subscription;
        await handleTrialEnding(trialEndEvent);
        break;

      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;

      case "invoice.paid":
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(failedInvoice);
        break;

      case "customer.subscription.created":
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(updatedSubscription);
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(deletedSubscription);
        break;
    }

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

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      billingCycleAnchor: new Date(subscription.billing_cycle_anchor * 1000),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      pricePerAsset: subscription.items.data[0]?.price.unit_amount
        ? (subscription.items.data[0].price.unit_amount / 100).toString()
        : "0",
      plan: determinePlanType(price?.id),
    },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const price = subscription.items.data[0]?.price;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      billingCycleAnchor: new Date(subscription.billing_cycle_anchor * 1000),
      trialEndsAt: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      pricePerAsset: subscription.items.data[0]?.price.unit_amount
        ? (subscription.items.data[0].price.unit_amount / 100).toString()
        : "0",
      plan: determinePlanType(price?.id),
    },
  });
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

    // const company = await tx.company.findFirst({
    //   where: { subscription: { stripeSubscriptionId: subscription.id } },
    // });

    // if (company) {
    //   await tx.company.update({
    //     where: { id: company.id },
    //     data: { status: CompanyStatus.INACTIVE },
    //   });
    // }
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.companyId) {
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      console.error("No subscription ID found in checkout session!");
      return;
    }

    // Fetch the subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const price = subscription.items.data[0]?.price;

    // Store the subscription in the database
    await prisma.subscription.create({
      data: {
        stripeSubscriptionId: subscriptionId,
        companyId: session.metadata.companyId,
        status: subscription.status,
        stripePriceId: price?.id || "",
        stripeCustomerId: session.customer as string,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        billingCycleAnchor: new Date(subscription.billing_cycle_anchor * 1000),
        trialEndsAt: subscription.trial_end
          ? new Date(subscription.trial_end * 1000)
          : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        pricePerAsset: price?.unit_amount
          ? (price.unit_amount / 100).toString()
          : "0",
        plan: determinePlanType(price?.id),
      },
    });

    await prisma.company.update({
      where: { id: session.metadata.companyId },
      data: {
        status: CompanyStatus.ACTIVE,
      },
    });
  }
}

function determinePlanType(priceId: string | undefined): PlanType {
  if (!priceId) return PlanType.FREE;

  // Add your logic to map price IDs to plan types
  // Example:
  switch (priceId) {
    case process.env.STRIPE_PRICE_ID_PRO:
      return PlanType.PRO;
    case process.env.STRIPE_PRICE_ID_BUSINESS:
      return PlanType.ENTERPRISE;
    default:
      return PlanType.FREE;
  }
}
