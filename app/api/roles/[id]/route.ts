import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { remove, update } from "@/lib/actions/role.actions";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const result = await update(params.id, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLE_PATCH]", error);
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

    const result = await remove(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
