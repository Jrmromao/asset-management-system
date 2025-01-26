"use server";

import { prisma } from "@/app/db";
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51PifCH2N5SBY44N5QTQZWyJn8oxmCVaYkWDUWXGmr5Yp2fmlwWo4SUKtpai2tC2ku8TkJ9Y3FBrLyeMQM7ufS8pE00rJwIf2bW",
);

export const createSubscription = async (
  companyId: string,
  email: string,
  assetCount: number,
) => {
  try {
    const customer = await createStripeCustomer(email, companyId);
    const subscription = await createStripeSubscription(
      customer.id,
      assetCount,
    );
    return await createDbSubscription(
      companyId,
      customer.id,
      subscription.id,
      assetCount,
    );
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new Error(`Stripe error: ${error.message}`);
    }
    throw error;
  }
};

async function createStripeCustomer(email: string, companyId: string) {
  return stripe.customers.create({
    email,
    metadata: { companyId },
  });
}

async function createStripeSubscription(
  customerId: string,
  assetCount: number,
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: process.env.STRIPE_PRICE_ID }],
    trial_period_days: 30,
    metadata: { assetQuota: assetCount },
  });
}

async function createDbSubscription(
  companyId: string,
  customerId: string,
  stripeSubscriptionId: string,
  assetCount: number,
) {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.create({
    data: {
      companyId,
      stripeCustomerId: customerId,
      stripeSubscriptionId,
      stripePriceId: process.env.STRIPE_PRICE_ID!,
      status: "TRIAL",
      billingCycleAnchor: now,
      currentPeriodStart: now,
      currentPeriodEnd: trialEnd,
      pricePerAsset: 0.003,
      plan: "FREE",
    },
  });

  await updateUsageRecord(subscription.id, assetCount);
  return subscription;
}

async function updateUsageRecord(
  subscriptionId: string,
  purchasedQuota: number,
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    // rejectOnNotFound: true,
  });

  const { items } = await stripe.subscriptions.retrieve(
    subscription!.stripeSubscriptionId,
  );
  const subscriptionItem = items.data[0];

  const stripeUsage = await stripe.subscriptionItems.createUsageRecord(
    subscriptionItem.id,
    { quantity: purchasedQuota },
  );

  return prisma.usageRecord.create({
    data: {
      subscriptionId,
      purchasedAssetQuota: purchasedQuota,
      actualAssetCount: purchasedQuota,
      billingPeriodStart: subscription!.currentPeriodStart,
      billingPeriodEnd: subscription!.currentPeriodEnd,
      stripeUsageRecordId: stripeUsage.id,
      pricePerAsset: subscription!.pricePerAsset,
      totalAmount: Number(subscription!.pricePerAsset) * purchasedQuota,
    },
  });
}

export const handleTrialEnd = async (subscriptionId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    // rejectOnNotFound: true,
  });

  await prisma.subscription.update({
    where: { id: subscription!.id },
    data: { status: "ACTIVE" },
  });
};
