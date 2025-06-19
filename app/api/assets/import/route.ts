import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { processAssetsCSV } from "@/lib/actions/assets.actions";

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { fileContent } = body;

    if (!fileContent) {
      return new NextResponse("No file content provided", { status: 400 });
    }

    const result = await processAssetsCSV(fileContent);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("[ASSETS_IMPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 