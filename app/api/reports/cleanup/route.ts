import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAllAssets } from "@/lib/actions/assets.actions";
import ReportCleanupService from "@/lib/services/report-cleanup.service";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get company ID from assets
    const assetsRes = await getAllAssets();
    if (!assetsRes.success || !assetsRes.data || assetsRes.data.length === 0) {
      return NextResponse.json(
        { error: "No company found. Please ensure you have assets created." },
        { status: 400 },
      );
    }

    const companyId = assetsRes.data[0].companyId;
    const body = await request.json();
    const { action, customPolicies } = body;

    const cleanupService = ReportCleanupService.getInstance();

    switch (action) {
      case "cleanup": {
        const stats = await cleanupService.cleanupOldReports(
          companyId,
          customPolicies,
        );
        return NextResponse.json({
          success: true,
          message: "Cleanup completed successfully",
          stats,
        });
      }

      case "stats": {
        const stats = await cleanupService.getStorageStats(companyId);
        return NextResponse.json({
          success: true,
          stats,
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'cleanup' or 'stats'" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in cleanup API:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get company ID from assets
    const assetsRes = await getAllAssets();
    if (!assetsRes.success || !assetsRes.data || assetsRes.data.length === 0) {
      return NextResponse.json(
        { error: "No company found. Please ensure you have assets created." },
        { status: 400 },
      );
    }

    const companyId = assetsRes.data[0].companyId;
    const cleanupService = ReportCleanupService.getInstance();

    // Get storage statistics
    const stats = await cleanupService.getStorageStats(companyId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting cleanup stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
