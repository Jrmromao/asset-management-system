import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { userService } from "@/services/user/userService";
import { prisma } from "@/app/db";

interface RouteParams {
  params: {
    id: string;
  };
}

async function validateRequest(supabaseUser: any) {
  if (!supabaseUser) {
    return { error: "Unauthorized", status: 401 };
  }

  const companyId = supabaseUser.user_metadata?.companyId;
  if (!companyId) {
    return { error: "No company associated with your account", status: 400 };
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    return { error: "Invalid company ID or company not found", status: 400 };
  }

  return { companyId, company };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validation = await validateRequest(user);
    if ("error" in validation) {
      return new NextResponse(validation.error, { status: validation.status });
    }

    // Ensure user belongs to the same company
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!targetUser || targetUser.companyId !== validation.companyId) {
      return new NextResponse("User not found", { status: 404 });
    }

    const result = await userService.findById(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[USER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validation = await validateRequest(user);
    if ("error" in validation) {
      return new NextResponse(validation.error, { status: validation.status });
    }

    // Ensure user belongs to the same company
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!targetUser || targetUser.companyId !== validation.companyId) {
      return new NextResponse("User not found", { status: 404 });
    }

    const result = await userService.deleteUser(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[USER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const validation = await validateRequest(user);
    if ("error" in validation) {
      return new NextResponse(validation.error, { status: validation.status });
    }

    // Ensure user belongs to the same company
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { companyId: true },
    });

    if (!targetUser || targetUser.companyId !== validation.companyId) {
      return new NextResponse("User not found", { status: 404 });
    }

    const body = await request.json();

    // Prevent changing company ID to a different company
    if (body.companyId && body.companyId !== validation.companyId) {
      return new NextResponse("Cannot change user's company", { status: 400 });
    }

    const result = await userService.updateUser(params.id, {
      ...body,
      companyId: validation.companyId, // Ensure company ID stays the same
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[USER_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
