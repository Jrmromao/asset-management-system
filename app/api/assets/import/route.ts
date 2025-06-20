import { processAssetCSV } from "@/lib/actions/assets.actions";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const csvContent = await request.text();

    if (!csvContent) {
      return NextResponse.json(
        { success: false, error: "No CSV content provided" },
        { status: 400 },
      );
    }

    const response = await processAssetCSV(csvContent);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.message },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: response.message,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import assets" },
      { status: 500 },
    );
  }
}
