import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createCustomerPortalSession } from "@/lib/actions/stripe.actions";
import { prisma } from "@/app/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Manage Plan API] User ID:", userId);

    // Get user and company info
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const companyId = user.privateMetadata?.companyId as string;

    console.log("[Manage Plan API] Company ID:", companyId);

    if (!companyId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get subscription with customer ID
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: { company: true },
    });

    console.log("[Manage Plan API] Subscription found:", !!subscription);
    console.log(
      "[Manage Plan API] Stripe Customer ID:",
      subscription?.stripeCustomerId,
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 },
      );
    }

    if (!subscription.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer ID found" },
        { status: 400 },
      );
    }

    // Create customer portal session
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`;
    console.log("[Manage Plan API] Return URL:", returnUrl);

    const result = await createCustomerPortalSession(
      subscription.stripeCustomerId,
      returnUrl,
    );

    console.log("[Manage Plan API] Portal session result:", result);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Error creating customer portal session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
