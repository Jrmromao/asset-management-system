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

    // Get user and company info
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const companyId = user.privateMetadata?.companyId as string;

    if (!companyId) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 },
      );
    }

    // Test Stripe customer retrieval
    let customer;
    try {
      customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
      console.log("Customer retrieved:", customer);
    } catch (error) {
      console.error("Error retrieving customer:", error);
      return NextResponse.json(
        {
          error: "Failed to retrieve Stripe customer",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 },
      );
    }

    // Test portal session creation
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
      });

      return NextResponse.json({
        success: true,
        url: session.url,
        customer: {
          id: customer.id,
          email: "deleted" in customer ? null : customer.email,
          created: "deleted" in customer ? null : customer.created,
        },
      });
    } catch (error) {
      console.error("Error creating portal session:", error);
      return NextResponse.json(
        {
          error: "Failed to create portal session",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Test portal error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
