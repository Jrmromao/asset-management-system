import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkin } from "@/lib/actions/assets.actions";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await checkin(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSET_CHECKIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
