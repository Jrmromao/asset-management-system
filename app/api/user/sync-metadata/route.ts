import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";

export async function POST(req: NextRequest) {
  try {
    console.log("🔄 [User Metadata Sync] Starting sync...");

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 [User Metadata Sync] User ID:", userId);

    // Find the user in the database
    const dbUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      include: {
        company: true,
        role: true,
      },
    });

    console.log("🔍 [User Metadata Sync] DB User found:", !!dbUser);
    console.log(
      "🔍 [User Metadata Sync] DB User company ID:",
      dbUser?.companyId,
    );

    if (!dbUser) {
      return NextResponse.json(
        {
          error: "User not found in database. Please complete registration.",
          needsRegistration: true,
        },
        { status: 404 },
      );
    }

    // Get Clerk user metadata
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    console.log("🔍 [User Metadata Sync] Clerk metadata:", {
      publicMetadata: clerkUser.publicMetadata,
      privateMetadata: clerkUser.privateMetadata,
    });

    // If user has no company ID in database, try to get it from Clerk
    if (!dbUser.companyId) {
      const companyIdFromClerk = clerkUser.privateMetadata?.companyId as string;

      if (companyIdFromClerk) {
        console.log(
          "✅ [User Metadata Sync] Found company ID in Clerk, updating database...",
        );

        // Update user's company ID in database
        const updatedUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { companyId: companyIdFromClerk },
          include: {
            company: true,
            role: true,
          },
        });

        console.log(
          "✅ [User Metadata Sync] Updated user with company ID:",
          companyIdFromClerk,
        );

        return NextResponse.json({
          success: true,
          message: "User metadata synced successfully",
          companyId: companyIdFromClerk,
          userId: updatedUser.id,
          synced: true,
        });
      } else {
        // No company ID in either place - user needs to complete registration
        return NextResponse.json(
          {
            error:
              "No company association found. Please complete company registration.",
            needsRegistration: true,
            companyId: null,
          },
          { status: 400 },
        );
      }
    }

    // User already has company ID, just sync the metadata to ensure consistency
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        userId: dbUser.id,
        companyId: dbUser.companyId,
        role: dbUser.role?.name || "User",
        onboardingComplete: true,
      },
      privateMetadata: {
        companyId: dbUser.companyId,
      },
    });

    console.log("✅ [User Metadata Sync] Metadata synced for existing user");

    return NextResponse.json({
      success: true,
      message: "User metadata synced successfully",
      companyId: dbUser.companyId,
      userId: dbUser.id,
      synced: true,
    });
  } catch (error) {
    console.error("❌ [User Metadata Sync] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to sync user metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
