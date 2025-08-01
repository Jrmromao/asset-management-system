import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all generated reports with old file paths
    const reportsToFix = await prisma.generatedReport.findMany({
      where: {
        OR: [
          { filePath: { startsWith: "/reports/" } },
          { filePath: { not: { startsWith: "/api/reports/download/" } } },
        ],
      },
    });

    console.log(`Found ${reportsToFix.length} reports to fix`);

    // Update each report with the correct file path
    const updatePromises = reportsToFix.map((report) =>
      prisma.generatedReport.update({
        where: { id: report.id },
        data: {
          filePath: `/api/reports/download/${report.id}`,
        },
      }),
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: `Fixed ${reportsToFix.length} report file paths`,
      data: {
        reportsFixed: reportsToFix.length,
        reportIds: reportsToFix.map((r) => r.id),
      },
    });
  } catch (error) {
    console.error("Error fixing report paths:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
