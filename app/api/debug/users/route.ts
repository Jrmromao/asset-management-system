import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 [Debug Users API] Starting debug...");

    // Get auth state
    const { orgId, userId } = await auth();
    console.log("🔍 [Debug Users API] Auth state:", { orgId, userId });

    // Get Clerk user and organization info
    let clerkUserInfo = null;
    let clerkOrganizations: any = null;
    if (userId) {
      try {
        const clerk = await clerkClient();
        clerkUserInfo = await clerk.users.getUser(userId);
        clerkOrganizations = await clerk.users.getOrganizationMembershipList({
          userId: userId,
        });
      } catch (error) {
        console.error("Error fetching Clerk info:", error);
      }
    }

    // Get all users in database
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        oauthId: true,
        companyId: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 10,
    });

    // Get current user specifically
    let currentUser = null;
    if (userId) {
      currentUser = await prisma.user.findFirst({
        where: { oauthId: userId },
        include: {
          role: true,
          company: true,
        },
      });
    }

    // Get all companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        clerkOrgId: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    // Get all roles
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        companyId: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    const debugInfo = {
      auth: {
        orgId,
        userId,
        hasAuth: !!(orgId && userId),
      },
      clerk: {
        userInfo: clerkUserInfo
          ? {
              id: clerkUserInfo.id,
              emailAddresses: clerkUserInfo.emailAddresses,
              publicMetadata: clerkUserInfo.publicMetadata,
              privateMetadata: clerkUserInfo.privateMetadata,
            }
          : null,
        organizations:
          clerkOrganizations?.data?.map((org: any) => ({
            id: org.organization.id,
            name: org.organization.name,
            role: org.role,
          })) || [],
      },
      currentUser,
      database: {
        totalUsers: allUsers.length,
        totalCompanies: companies.length,
        totalRoles: roles.length,
        users: allUsers,
        companies,
        roles,
      },
    };

    console.log("🔍 [Debug Users API] Debug info:", debugInfo);

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    console.error("❌ [Debug Users API] Error:", error);
    return NextResponse.json(
      {
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
