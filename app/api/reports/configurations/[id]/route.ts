import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import ReportCleanupService from "@/lib/services/report-cleanup.service";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Configuration ID is required" },
        { status: 400 }
      );
    }

    // Check if configuration exists
    const configuration = await prisma.reportConfiguration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Report configuration not found" },
        { status: 404 }
      );
    }

    // Delete associated report files from S3 first
    const cleanupService = ReportCleanupService.getInstance();
    const cleanupStats = await cleanupService.deleteReportsForConfiguration(id);

    // Delete the configuration (this will cascade delete metrics and generated reports)
    await prisma.reportConfiguration.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Report configuration deleted successfully",
      cleanupStats,
    });
  } catch (error) {
    console.error("Error deleting report configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
} 