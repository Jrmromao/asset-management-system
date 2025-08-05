import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { canAddUser, canAddItems } from "@/lib/utils/planRestrictions";

export async function checkUserLimit(request: NextRequest) {
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

    // Check if can add more users
    const userLimitCheck = await canAddUser(user.company.clerkOrgId || "");

    if (!userLimitCheck.canAdd) {
      return NextResponse.json(
        {
          error: userLimitCheck.error || "User limit reached",
          plan: userLimitCheck.plan,
          currentUsers: userLimitCheck.currentUsers,
          maxUsers: userLimitCheck.maxUsers,
        },
        { status: 403 },
      );
    }

    return null; // Allow the request to continue
  } catch (error) {
    console.error("Error checking user limit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function checkItemLimit(
  request: NextRequest,
  itemType: "asset" | "accessory" | "license",
) {
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

    // Get current item counts
    const [assetCount, accessoryCount, licenseCount] = await Promise.all([
      prisma.asset.count({
        where: { companyId: user.company.id },
      }),
      prisma.accessory.count({
        where: { companyId: user.company.id },
      }),
      prisma.license.count({
        where: { companyId: user.company.id },
      }),
    ]);

    const totalItems = assetCount + accessoryCount + licenseCount;

    // Check if can add more items
    const itemLimitCheck = await canAddItems(
      user.company.clerkOrgId || "",
      totalItems,
    );

    if (!itemLimitCheck.canAdd) {
      return NextResponse.json(
        {
          error: itemLimitCheck.error || "Item limit reached",
          plan: itemLimitCheck.plan,
          currentItems: itemLimitCheck.currentItems,
          maxItems: itemLimitCheck.maxItems,
          breakdown: {
            assets: assetCount,
            accessories: accessoryCount,
            licenses: licenseCount,
          },
        },
        { status: 403 },
      );
    }

    return null; // Allow the request to continue
  } catch (error) {
    console.error("Error checking item limit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to check limits before any creation
export async function checkPlanLimits(
  request: NextRequest,
  checkUsers: boolean = false,
  checkItems: boolean = false,
) {
  if (checkUsers) {
    const userCheck = await checkUserLimit(request);
    if (userCheck) return userCheck;
  }

  if (checkItems) {
    const itemCheck = await checkItemLimit(request, "asset"); // Default to asset
    if (itemCheck) return itemCheck;
  }

  return null; // All checks passed
}
