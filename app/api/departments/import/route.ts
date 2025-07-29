import { NextRequest, NextResponse } from "next/server";
import { bulkCreate } from "@/lib/actions/department.actions";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    console.log(
      "[Departments Import API] Received request body:",
      JSON.stringify(json, null, 2),
    );
    const { departments } = json;

    if (!Array.isArray(departments)) {
      console.log(
        "[Departments Import API] Invalid data format - departments is not an array:",
        typeof departments,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format. Expected array of departments.",
        },
        { status: 400 },
      );
    }

    console.log(
      "[Departments Import API] Processing",
      departments.length,
      "departments",
    );

    // Use the bulkCreate action which handles authentication and companyId extraction
    const result = await bulkCreate(departments);

    if (!result.success) {
      console.log("[Departments Import API] Bulk create failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to import departments",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.data?.successCount || 0} departments`,
      data: {
        totalProcessed: departments.length,
        successCount: result.data?.successCount || 0,
        errorCount: result.data?.errorCount || 0,
        errors: result.data?.errors || [],
      },
    });
  } catch (error) {
    console.error("Department import error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to import departments" },
      { status: 500 },
    );
  }
}
