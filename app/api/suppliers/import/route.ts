import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/supplier.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Suppliers Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { suppliers } = json;

    if (!Array.isArray(suppliers)) {
      console.log(
        "[Suppliers Import API] Invalid data format - suppliers is not an array:",
        typeof suppliers,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of suppliers.",
        },
        { status: 400 },
      );
    }
    
    console.log(
      "[Suppliers Import API] Processing",
      suppliers.length,
      "suppliers",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(suppliers);

    if (!result.success) {
      console.log("[Suppliers Import API] Bulk create failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import suppliers",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} suppliers`,
      data: {
        totalProcessed: suppliers.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });

  } catch (error) {
    console.error("Supplier import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import suppliers" },
      { status: 500 },
    );
  }
} 