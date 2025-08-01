import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { getAllAssets } from "@/lib/actions/assets.actions";

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

    // Fetch all reports for the company without limit
    const allReports = await prisma.generatedReport.findMany({
      where: { companyId },
      orderBy: { generatedAt: "desc" },
      include: {
        configuration: {
          select: {
            name: true,
            format: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const transformedReports = allReports.map((report) => ({
      id: report.id,
      name: report.title,
      createdAt: report.generatedAt.toISOString(),
      sizeMB: report.fileSize || 0,
      status: report.status || "completed",
      scheduledDeletionAt: null, // TODO: Implement scheduled deletion
      type: report.format,
      filePath: report.filePath,
      configurationName: report.configuration?.name || "Unknown",
    }));

    return NextResponse.json({
      success: true,
      data: transformedReports,
    });
  } catch (error) {
    console.error("Error fetching all reports:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, restore } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 },
      );
    }

    // If restore is true, set status to 'active', else 'archived'
    const updatedReport = await prisma.generatedReport.update({
      where: { id },
      data: { status: restore ? "active" : "archived" },
    });

    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error) {
    console.error("Error updating report status:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 },
      );
    }

    await prisma.generatedReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
