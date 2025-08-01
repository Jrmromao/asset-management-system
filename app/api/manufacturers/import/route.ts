import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/manufacturer.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Manufacturers Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { manufacturers } = json;

    if (!Array.isArray(manufacturers)) {
      console.log(
        "[Manufacturers Import API] Invalid data format - manufacturers is not an array:",
        typeof manufacturers,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of manufacturers.",
        },
        { status: 400 },
      );
    }

    console.log(
      "[Manufacturers Import API] Processing",
      manufacturers.length,
      "manufacturers",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(manufacturers);

    if (!result.success) {
      console.log(
        "[Manufacturers Import API] Bulk create failed:",
        result.error,
      );
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import manufacturers",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} manufacturers`,
      data: {
        totalProcessed: manufacturers.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });
  } catch (error) {
    console.error("Manufacturer import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import manufacturers" },
      { status: 500 },
    );
  }
}
