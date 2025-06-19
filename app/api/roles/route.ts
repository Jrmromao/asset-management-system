import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getAll, insert, remove, update } from "@/lib/actions/role.actions";

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await getAll(user);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const result = await insert(user, body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ROLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 