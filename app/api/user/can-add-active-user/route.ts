import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { canAddActiveUser } from "@/lib/services/usage.service";

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
    if (!companyId) {
      return NextResponse.json(
        { error: "No company ID found in user metadata." },
        { status: 401 },
      );
    }
    // Check if another active user can be added
    const result = await canAddActiveUser(companyId as string);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/user/can-add-active-user:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
