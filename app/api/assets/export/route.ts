import { NextResponse } from "next/server";
import { exportToCSV } from "@/lib/actions/assets.actions";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const result = await exportToCSV();
    if (!result.success) {
      return new NextResponse(result.error, { status: 500 });
    }

    // Set headers for CSV download
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set(
      "Content-Disposition",
      `attachment; filename="assets-${new Date().toISOString().split("T")[0]}.csv"`,
    );

    return new NextResponse(result.data, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[ASSETS_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
