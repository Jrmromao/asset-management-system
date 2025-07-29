import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/model.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Models Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { models } = json;

    if (!Array.isArray(models)) {
      console.log(
        "[Models Import API] Invalid data format - models is not an array:",
        typeof models,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of models.",
        },
        { status: 400 },
      );
    }
    
    console.log(
      "[Models Import API] Processing",
      models.length,
      "models",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(models);

    if (!result.success) {
      console.log("[Models Import API] Bulk create failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import models",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} models`,
      data: {
        totalProcessed: models.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });

  } catch (error) {
    console.error("Model import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import models" },
      { status: 500 },
    );
  }
} 