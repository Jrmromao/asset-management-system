import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/location.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Locations Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { locations } = json;

    if (!Array.isArray(locations)) {
      console.log(
        "[Locations Import API] Invalid data format - locations is not an array:",
        typeof locations,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of locations.",
        },
        { status: 400 },
      );
    }

    console.log(
      "[Locations Import API] Processing",
      locations.length,
      "locations",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(locations);

    if (!result.success) {
      console.log("[Locations Import API] Bulk create failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import locations",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} locations`,
      data: {
        totalProcessed: locations.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });
  } catch (error) {
    console.error("Location import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import locations" },
      { status: 500 },
    );
  }
}
