import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { userService } from "@/services/user/userService";
import { prisma } from "@/app/db";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const companyId = user.user_metadata?.companyId;
    if (!companyId) {
      return new NextResponse("No company associated with your account", {
        status: 400,
      });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return new NextResponse("Invalid company ID or company not found", {
        status: 400,
      });
    }

    const users = await prisma.user.findMany({
      where: {
        companyId: companyId,
      },
      include: {
        role: true,
        department: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const companyId = user.user_metadata?.companyId;
    if (!companyId) {
      return new NextResponse("No company associated with your account", {
        status: 400,
      });
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return new NextResponse("Invalid company ID or company not found", {
        status: 400,
      });
    }

    const body = await request.json();
    const result = await userService.createUser({
      ...body,
      companyId,
    });

    if (!result.success) {
      return new NextResponse(result.error || "Failed to create user", {
        status: result.error?.includes("company") ? 400 : 500,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
