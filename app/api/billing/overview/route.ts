import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user metadata to find company
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const companyId = user.privateMetadata?.companyId as string;

    console.log("[Billing API] User metadata:", user.publicMetadata);
    console.log("[Billing API] Private metadata:", user.privateMetadata);
    console.log("[Billing API] Company ID:", companyId);

    if (!companyId) {
      console.log("[Billing API] No companyId in user metadata");
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 404 },
      );
    }

    // Find the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    console.log("[Billing API] Company found:", !!company);

    if (!company) {
      console.log("[Billing API] Company not found in database");
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get usage data
    const assetCount = await prisma.asset.count({
      where: { companyId: company.id },
    });

    const userCount = await prisma.user.count({
      where: { companyId: company.id, active: true },
    });

    // Find the company's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { companyId: company.id },
      include: {
        pricingPlan: true,
      },
    });

    console.log("[Billing API] Subscription found:", !!subscription);

    // Get Stripe subscription details if available
    let stripeSubscription = null;
    let stripeCustomer = null;

    if (subscription?.stripeCustomerId) {
      try {
        // Get Stripe customer
        stripeCustomer = await stripe.customers.retrieve(
          subscription.stripeCustomerId,
        );

        // Get Stripe subscription
        if (subscription.stripeSubscriptionId) {
          stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId,
          );
        }
      } catch (stripeError) {
        console.error("[Billing API] Stripe error:", stripeError);
        // Continue without Stripe data if there's an error
      }
    }

    // Return billing overview with or without subscription
    const billingOverview = {
      company: {
        id: company.id,
        name: company.name,
        status: company.status,
      },
      subscription: subscription
        ? {
            id: subscription.id,
            status: subscription.status,
            assetQuota: subscription.assetQuota,
            billingCycle: subscription.billingCycle,
            trialEndsAt: subscription.trialEndsAt,
            plan: subscription.pricingPlan,
            stripe: {
              customerId: subscription.stripeCustomerId,
              subscriptionId: subscription.stripeSubscriptionId,
              stripeSubscription: stripeSubscription,
              stripeCustomer: stripeCustomer,
            },
          }
        : null,
      usage: {
        assets: {
          used: assetCount,
          limit: subscription?.pricingPlan?.assetQuota || 0,
        },
        users: {
          used: userCount,
          limit: subscription?.pricingPlan?.assetQuota || 0,
        },
      },
    };

    return NextResponse.json(billingOverview);
  } catch (error) {
    console.error("[Billing Overview API]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
