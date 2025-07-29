import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/inventory.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Inventory Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { inventories } = json;

    if (!Array.isArray(inventories)) {
      console.log(
        "[Inventory Import API] Invalid data format - inventories is not an array:",
        typeof inventories,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of inventories.",
        },
        { status: 400 },
      );
    }

    console.log(
      "[Inventory Import API] Processing",
      inventories.length,
      "inventories",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(inventories);

    if (!result.success) {
      console.log("[Inventory Import API] Bulk create failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import inventories",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} inventories`,
      data: {
        totalProcessed: inventories.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });
  } catch (error) {
    console.error("Inventory import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import inventories" },
      { status: 500 },
    );
  }
}
