import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔍 [Debug User Status] Checking user:", userId);

    // Get user from database
    const dbUser = await prisma.user.findFirst({
      where: { oauthId: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            clerkOrgId: true,
            status: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            isAdmin: true,
          },
        },
      },
    });

    // Get user from Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    // Get all companies in the database
    const allCompanies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        clerkOrgId: true,
        status: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Check if user is in any organization
    const userOrganizations = await clerk.users.getOrganizationMembershipList({
      userId,
    });

    const debugInfo = {
      timestamp: new Date().toISOString(),
      userId,
      database: {
        userFound: !!dbUser,
        user: dbUser
          ? {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              companyId: dbUser.companyId,
              roleId: dbUser.roleId,
              status: dbUser.status,
            }
          : null,
        company: dbUser?.company || null,
        role: dbUser?.role || null,
      },
      clerk: {
        userFound: !!clerkUser,
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata,
        organizations: userOrganizations.data.map((org) => ({
          id: org.organization.id,
          name: org.organization.name,
          role: org.role,
        })),
      },
      companies: {
        total: allCompanies.length,
        list: allCompanies,
      },
      issues: [] as string[],
      recommendations: [] as string[],
    };

    // Analyze issues
    if (!dbUser) {
      debugInfo.issues.push("User not found in database");
      debugInfo.recommendations.push("User needs to complete registration");
    } else {
      if (!dbUser.companyId) {
        debugInfo.issues.push("User has no company association in database");

        const clerkCompanyId = clerkUser.privateMetadata?.companyId as string;
        if (clerkCompanyId) {
          debugInfo.recommendations.push(
            `Found company ID in Clerk metadata: ${clerkCompanyId}. Run sync to update database.`,
          );
        } else {
          debugInfo.recommendations.push(
            "No company ID in Clerk metadata either. User needs to complete company registration.",
          );
        }
      }

      if (!dbUser.company) {
        debugInfo.issues.push("Company not found in database");
      }

      if (!dbUser.role) {
        debugInfo.issues.push("User role not found");
      }
    }

    if (userOrganizations.data.length === 0) {
      debugInfo.issues.push("User not in any Clerk organization");
      debugInfo.recommendations.push(
        "User should be added to a Clerk organization",
      );
    }

    const clerkCompanyId = clerkUser.privateMetadata?.companyId as string;
    const publicCompanyId = clerkUser.publicMetadata?.companyId as string;

    if (clerkCompanyId !== publicCompanyId) {
      debugInfo.issues.push(
        "Company ID mismatch between public and private metadata",
      );
    }

    if (
      dbUser?.companyId &&
      clerkCompanyId &&
      dbUser.companyId !== clerkCompanyId
    ) {
      debugInfo.issues.push(
        "Company ID mismatch between database and Clerk metadata",
      );
    }

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("❌ [Debug User Status] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get user status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
