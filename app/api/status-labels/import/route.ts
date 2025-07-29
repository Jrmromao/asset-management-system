import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/statusLabel.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Status Labels Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { statusLabels } = json;

    if (!Array.isArray(statusLabels)) {
      console.log(
        "[Status Labels Import API] Invalid data format - statusLabels is not an array:",
        typeof statusLabels,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of status labels.",
        },
        { status: 400 },
      );
    }
    
    console.log(
      "[Status Labels Import API] Processing",
      statusLabels.length,
      "status labels",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(statusLabels);

    if (!result.success) {
      console.log("[Status Labels Import API] Bulk create failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import status labels",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} status labels`,
      data: {
        totalProcessed: statusLabels.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });

  } catch (error) {
    console.error("Status labels import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import status labels" },
      { status: 500 },
    );
  }
} 