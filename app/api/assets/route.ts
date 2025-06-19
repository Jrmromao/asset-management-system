import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { getAll, insert } from "@/lib/actions/assets.actions";

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const options = {
      orderBy: searchParams.get('orderBy') as "name" | "createdAt" | undefined,
      order: searchParams.get('order') as "asc" | "desc" | undefined,
      search: searchParams.get('search') || undefined
    };

    const result = await getAll(options);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSETS_GET]", error);
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
    const result = await insert(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSETS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 