import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import ReportCleanupService from "@/lib/services/report-cleanup.service";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } },
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
        { status: 400 },
      );
    }

    // Check if configuration exists
    const configuration = await prisma.reportConfiguration.findUnique({
      where: { id },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Report configuration not found" },
        { status: 404 },
      );
    }

    // Delete associated report files from S3 first
    const cleanupService = ReportCleanupService.getInstance();
    const cleanupStats = await cleanupService.deleteReportsForConfiguration(id);

    // Delete the configuration (this will cascade delete metrics and generated reports)
    await prisma.reportConfiguration.delete({
      where: { id },
    });

    // --- AUDIT LOG ---
    await createAuditLog({
      companyId: configuration.companyId,
      action: "REPORT_DELETED",
      entity: "REPORT_CONFIGURATION",
      entityId: id,
      details: `Report configuration deleted: ${configuration.name} (${configuration.format}) by user ${userId}`,
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
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } },
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
        { status: 400 },
      );
    }

    // Fetch the configuration
    const configuration = await prisma.reportConfiguration.findUnique({
      where: { id },
      include: { metrics: true },
    });

    if (!configuration) {
      return NextResponse.json(
        { error: "Report configuration not found" },
        { status: 404 },
      );
    }

    // --- AUDIT LOG ---
    await createAuditLog({
      companyId: configuration.companyId,
      action: "REPORT_CONFIG_VIEWED",
      entity: "REPORT_CONFIGURATION",
      entityId: id,
      details: `Report configuration viewed: ${configuration.name} (${configuration.format}) by user ${userId}`,
    });

    return NextResponse.json({
      success: true,
      data: configuration,
    });
  } catch (error) {
    console.error("Error fetching report configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
