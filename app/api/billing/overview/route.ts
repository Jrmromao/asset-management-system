import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function GET(request: NextRequest) {
  try {
    // Get user from Clerk
    const { userId } = await auth();
    if (!userId) {
      console.log("[Billing API] No userId found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    console.log("[Billing API] User ID:", userId);

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

    // Find company by ID
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
      { error: "Failed to load billing overview" },
      { status: 500 },
    );
  }
}
