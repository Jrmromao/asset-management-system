import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import {
  PlanType as StaticPlanType,
  getFeaturesForPlan,
} from "@/lib/services/plan-features.service";

export async function GET(req: NextRequest) {
  try {
    // Get user session from Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    // Fetch Clerk user to get companyId from metadata
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    const companyId =
      clerkUser.privateMetadata?.companyId ||
      clerkUser.publicMetadata?.companyId;

    console.log("🔍 [Plan Features] Company ID:", companyId);

    console.log("🔍 [Plan Features] Clerk User:", clerkUser);
    if (!companyId) {
      return NextResponse.json(
        { error: "No company ID found in user metadata." },
        { status: 401 },
      );
    }

    // Fetch subscription and plan type
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: companyId as string },
      include: { pricingPlan: true },
    });
    if (!subscription?.pricingPlan) {
      return NextResponse.json(
        { error: "No active subscription or plan found." },
        { status: 404 },
      );
    }

    const planType = subscription.pricingPlan.planType?.toLowerCase?.();
    const staticPlanType = Object.values(StaticPlanType).find(
      (p) => p === planType,
    ) as StaticPlanType | undefined;
    if (!staticPlanType) {
      return NextResponse.json(
        { error: "Unknown plan type." },
        { status: 400 },
      );
    }

    const features = getFeaturesForPlan(staticPlanType);
    return NextResponse.json({ plan: staticPlanType, features });
  } catch (error) {
    console.error("Error in /api/user/plan-features:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
