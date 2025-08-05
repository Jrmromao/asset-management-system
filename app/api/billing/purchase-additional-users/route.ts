import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { purchaseAdditionalUsers } from "@/lib/actions/subscription.actions";
import { prisma } from "@/app/db";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId || !orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { additionalUsers } = body;

    if (
      !additionalUsers ||
      typeof additionalUsers !== "number" ||
      additionalUsers <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid additional users quantity" },
        { status: 400 },
      );
    }

    // Find company by Clerk orgId
    const company = await prisma.company.findFirst({
      where: { clerkOrgId: orgId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const result = await purchaseAdditionalUsers(company.id, additionalUsers);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: result.url,
    });
  } catch (error) {
    console.error("[Purchase Additional Users API]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
