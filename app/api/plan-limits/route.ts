import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { canAddUser, canAddItems } from "@/lib/utils/planRestrictions";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const user = await prisma.user.findFirst({
      where: { oauthId: userId },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get current counts
    const [userCount, assetCount, accessoryCount, licenseCount] =
      await Promise.all([
        // Count active users in the company
        prisma.user.count({
          where: {
            companyId: user.company.id,
            active: true,
          },
        }),
        // Count unique assets
        prisma.asset.count({
          where: { companyId: user.company.id },
        }),
        // Count unique accessories
        prisma.accessory.count({
          where: { companyId: user.company.id },
        }),
        // Count unique licenses
        prisma.license.count({
          where: { companyId: user.company.id },
        }),
      ]);

    const totalItems = assetCount + accessoryCount + licenseCount;

    // Check plan limits
    const userLimitCheck = await canAddUser(user.company.clerkOrgId || "");
    const itemLimitCheck = await canAddItems(
      user.company.clerkOrgId || "",
      totalItems,
    );

    return NextResponse.json({
      canAddUsers: userLimitCheck.canAdd,
      canAddItems: itemLimitCheck.canAdd,
      currentUsers: userCount,
      currentItems: totalItems,
      maxUsers: userLimitCheck.maxUsers,
      maxItems: itemLimitCheck.maxItems,
      plan: userLimitCheck.plan,
      userError: userLimitCheck.error,
      itemError: itemLimitCheck.error,
      breakdown: {
        assets: assetCount,
        accessories: accessoryCount,
        licenses: licenseCount,
      },
    });
  } catch (error) {
    console.error("Error checking plan limits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
