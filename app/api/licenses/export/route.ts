import { exportLicensesToCSV } from "@/lib/actions/license.actions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const response = await exportLicensesToCSV();

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    const csvContent = response.data;
    const headers = new Headers();
    headers.set("Content-Type", "text/csv");
    headers.set("Content-Disposition", "attachment; filename=licenses.csv");

    return new NextResponse(csvContent, { headers });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export licenses" },
      { status: 500 },
    );
  }
} 