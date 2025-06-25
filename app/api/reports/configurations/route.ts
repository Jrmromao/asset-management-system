import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      format,
      timePeriod,
      isScheduled,
      scheduleFrequency,
      metrics,
      companyId,
    } = body;

    // Validation
    if (!name || !format || !timePeriod || !companyId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create report configuration
    const reportConfiguration = await prisma.reportConfiguration.create({
      data: {
        name,
        format,
        timePeriod,
        isScheduled: isScheduled || false,
        scheduleFrequency: isScheduled ? scheduleFrequency : null,
        companyId,
        metrics: {
          create: metrics?.map((metric: any) => ({
            category: metric.category,
            metricName: metric.metricName,
            enabled: metric.enabled ?? true,
          })) || [],
        },
      },
      include: {
        metrics: true,
      },
    });

    // --- AUDIT LOG ---
    await createAuditLog({
      companyId,
      action: "REPORT_CREATED",
      entity: "REPORT_CONFIGURATION",
      entityId: reportConfiguration.id,
      details: `Report configuration created: ${name} (${format}) by user ${userId}`,
    });

    return NextResponse.json({
      success: true,
      data: reportConfiguration,
    });
  } catch (error) {
    console.error("Error creating report configuration:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      );
    }

    const configurations = await prisma.reportConfiguration.findMany({
      where: { companyId },
      include: {
        metrics: true,
        _count: {
          select: {
            generatedReports: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // --- AUDIT LOG ---
    await createAuditLog({
      companyId,
      action: "REPORT_CONFIG_VIEWED",
      entity: "REPORT_CONFIGURATION",
      details: `Report configurations viewed by user ${userId}`,
    });

    return NextResponse.json({
      success: true,
      data: configurations,
    });
  } catch (error) {
    console.error("Error fetching report configurations:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
} 