import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { checkout } from "@/lib/actions/assets.actions";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await checkout(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSET_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 