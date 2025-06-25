import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import { getAllAssets } from "@/lib/actions/assets.actions";
import S3Service from "@/services/aws/S3";

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
        { error: "No assets found. Please create some assets first." },
        { status: 400 }
      );
    }

    const companyId = assetsRes.data[0].companyId;

    // Initialize S3 storage for the company
    const s3Service = S3Service.getInstance();
    try {
      await s3Service.initializeCompanyStorage(companyId);
    } catch (error) {
      console.log("S3 initialization warning:", error);
      // Continue even if S3 fails for testing
    }

    // Create a test report configuration
    const testConfiguration = await prisma.reportConfiguration.create({
      data: {
        name: "Test Report",
        format: "pdf",
        timePeriod: "last30days",
        isScheduled: false,
        companyId,
        metrics: {
          create: [
            {
              category: "Assets",
              metricName: "Asset Distribution",
              enabled: true,
            },
            {
              category: "Environmental",
              metricName: "Energy Consumption",
              enabled: true,
            },
            {
              category: "Financial",
              metricName: "Cost Analysis",
              enabled: true,
            },
          ],
        },
      },
    });

    // Create a generated report
    const generatedReport = await prisma.generatedReport.create({
      data: {
        configurationId: testConfiguration.id,
        title: `Test Report - ${new Date().toLocaleDateString()}`,
        format: "pdf",
        filePath: "",
        fileSize: 2.5,
        status: "completed",
        companyId,
      },
    });

    // Update with the correct download path
    await prisma.generatedReport.update({
      where: { id: generatedReport.id },
      data: {
        filePath: `/api/reports/download/${generatedReport.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        reportId: generatedReport.id,
        downloadUrl: `/api/reports/download/${generatedReport.id}`,
        configurationId: testConfiguration.id,
      },
    });

  } catch (error) {
    console.error("Error creating test report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
} 