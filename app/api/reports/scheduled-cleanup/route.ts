import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import ReportCleanupService from "@/lib/services/report-cleanup.service";

// This endpoint should be called by a cron job or external scheduler
// It cleans up old reports for all companies
export async function POST(request: NextRequest) {
  try {
    // Verify the request is from an authorized source (e.g., cron job)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_CRON_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cleanupService = ReportCleanupService.getInstance();
    const allStats = {
      companiesProcessed: 0,
      totalDeletedReports: 0,
      totalDeletedFiles: 0,
      totalFreedSpace: 0,
      errors: [] as string[],
    };

    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { 
        // Only process active companies
        // Add any additional filters if needed
      },
      select: { id: true, name: true },
    });

    console.log(`Starting scheduled cleanup for ${companies.length} companies`);

    // Process each company
    for (const company of companies) {
      try {
        console.log(`Processing cleanup for company: ${company.name} (${company.id})`);
        
        const stats = await cleanupService.cleanupOldReports(company.id);
        
        allStats.companiesProcessed++;
        allStats.totalDeletedReports += stats.deletedReports;
        allStats.totalDeletedFiles += stats.deletedFiles;
        allStats.totalFreedSpace += stats.freedSpace;
        allStats.errors.push(...stats.errors);

        console.log(`Cleanup completed for ${company.name}: ${stats.deletedReports} reports, ${stats.freedSpace.toFixed(2)} MB freed`);
        
      } catch (error) {
        const errorMsg = `Failed to cleanup company ${company.name}: ${error}`;
        console.error(errorMsg);
        allStats.errors.push(errorMsg);
      }
    }

    // Log summary
    console.log(`Scheduled cleanup completed:`, {
      companiesProcessed: allStats.companiesProcessed,
      totalDeletedReports: allStats.totalDeletedReports,
      totalDeletedFiles: allStats.totalDeletedFiles,
      totalFreedSpace: `${allStats.totalFreedSpace.toFixed(2)} MB`,
      errorCount: allStats.errors.length,
    });

    return NextResponse.json({
      success: true,
      message: "Scheduled cleanup completed",
      stats: allStats,
    });

  } catch (error) {
    console.error("Scheduled cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Scheduled cleanup failed",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint for the cleanup service
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from an authorized source
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CLEANUP_CRON_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get basic statistics across all companies
    const totalReports = await prisma.generatedReport.count();
    const totalSize = await prisma.generatedReport.aggregate({
      _sum: { fileSize: true },
    });

    const oldReports = await prisma.generatedReport.count({
      where: {
        generatedAt: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
    });

    return NextResponse.json({
      success: true,
      systemStats: {
        totalReports,
        totalSizeInMB: totalSize._sum.fileSize || 0,
        reportsOlderThan30Days: oldReports,
        lastChecked: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Health check failed",
      },
      { status: 500 }
    );
  }
} 