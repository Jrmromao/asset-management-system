import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { loneeUserImportSchema } from "@/config/loneeUserImportConfig";
import { UserStatus } from "@prisma/client";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 [Create Lonee Users] Starting...");
    console.log("🔍 [Create Lonee Users] Request:", req);
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

    const users = await req.json();
    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: "Expected an array of users" },
        { status: 400 },
      );
    }
    const results = [];
    for (const user of users) {
      const parsed = loneeUserImportSchema.safeParse(user);
      if (!parsed.success) {
        results.push({ success: false, error: parsed.error.errors, user });
        continue;
      }
      const role = await prisma.role.findFirst({
        where: {
          name: "Lonee",
          isGlobal: true,
        },
      });
      if (!role?.id || !companyId || typeof companyId !== "string") {
        results.push({
          success: false,
          error: "Missing role or companyId",
          user,
        });
        continue;
      }
      try {
        const created = await prisma.user.create({
          data: {
            firstName: user.firstName,
            lastName: user.lastName,
            title: "Lonee",
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            employeeId: user.employeeId,
            roleId: role.id,
            active: true,
            status: UserStatus.ACTIVE,
            oauthId: null,
            companyId: typeof companyId === "string" ? companyId : "",
          },
        });
        console.log("🔍 [Create Lonee Users] Created user:", created);
        results.push({ success: true, user: created });
      } catch (err: any) {
        console.error("Error creating user:", err);
        results.push({ success: false, error: err.message, user });
      }
    }
    return NextResponse.json({ results }, { status: 200 });
  } catch (error: any) {
    console.error("Error creating lonee users:", error);
    return NextResponse.json(
      { error: "Failed to create lonee users", details: error.message },
      { status: 500 },
    );
  }
}
