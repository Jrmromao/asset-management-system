import { exportAssetsToCSV } from "@/lib/actions/assets.actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const response = await exportAssetsToCSV();

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    const csvContent = response.data;
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", "attachment; filename=assets.csv");

    return new NextResponse(csvContent, { headers });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export assets" },
      { status: 500 },
    );
  }
}
