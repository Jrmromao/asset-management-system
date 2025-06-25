import { prisma } from "@/app/db";
import S3Service from "@/services/aws/S3";

interface CleanupStats {
  deletedReports: number;
  deletedFiles: number;
  freedSpace: number; // in MB
  errors: string[];
}

interface RetentionPolicy {
  maxAgeInDays: number;
  maxReportsPerConfiguration: number;
  maxTotalSizeInMB: number;
  format?: string; // Optional: specific format cleanup
}

export class ReportCleanupService {
  private static instance: ReportCleanupService;
  private s3Service: S3Service;

  private constructor() {
    this.s3Service = S3Service.getInstance();
  }

  public static getInstance(): ReportCleanupService {
    if (!ReportCleanupService.instance) {
      ReportCleanupService.instance = new ReportCleanupService();
    }
    return ReportCleanupService.instance;
  }

  /**
   * Default retention policies based on report format and usage
   */
  private getDefaultRetentionPolicies(): Record<string, RetentionPolicy> {
    return {
      // PDF reports - keep longer as they're often archived
      pdf: {
        maxAgeInDays: 90,
        maxReportsPerConfiguration: 50,
        maxTotalSizeInMB: 500,
      },
      
      // Excel reports - business critical, moderate retention
      excel: {
        maxAgeInDays: 60,
        maxReportsPerConfiguration: 30,
        maxTotalSizeInMB: 200,
      },
      
      // CSV exports - often for data analysis, shorter retention
      csv: {
        maxAgeInDays: 30,
        maxReportsPerConfiguration: 20,
        maxTotalSizeInMB: 100,
      },
      
      // Dashboard JSON - temporary data, shortest retention
      dashboard: {
        maxAgeInDays: 7,
        maxReportsPerConfiguration: 10,
        maxTotalSizeInMB: 50,
      },
    };
  }

  /**
   * Clean up old reports based on retention policies
   */
  public async cleanupOldReports(
    companyId: string,
    customPolicies?: Record<string, RetentionPolicy>
  ): Promise<CleanupStats> {
    const stats: CleanupStats = {
      deletedReports: 0,
      deletedFiles: 0,
      freedSpace: 0,
      errors: [],
    };

    const policies = { ...this.getDefaultRetentionPolicies(), ...customPolicies };

    try {
      // Get all reports for the company
      const allReports = await prisma.generatedReport.findMany({
        where: { companyId },
        include: {
          configuration: true,
        },
        orderBy: { generatedAt: 'desc' },
      });

      // Group reports by format
      const reportsByFormat = allReports.reduce((acc, report) => {
        const format = report.format.toLowerCase();
        if (!acc[format]) acc[format] = [];
        acc[format].push(report);
        return acc;
      }, {} as Record<string, typeof allReports>);

      // Apply cleanup policies for each format
      for (const [format, reports] of Object.entries(reportsByFormat)) {
        const policy = policies[format];
        if (!policy) continue;

        const reportsToDelete = this.identifyReportsForDeletion(reports, policy);
        
        for (const report of reportsToDelete) {
          try {
            await this.deleteReport(companyId, report.id);
            stats.deletedReports++;
            stats.freedSpace += report.fileSize;
          } catch (error) {
            stats.errors.push(`Failed to delete report ${report.id}: ${error}`);
          }
        }
      }

      // Additional cleanup: Remove orphaned files in S3
      const orphanedFiles = await this.findOrphanedFiles(companyId);
      for (const fileKey of orphanedFiles) {
        try {
          await this.s3Service.deleteFile(companyId, fileKey);
          stats.deletedFiles++;
        } catch (error) {
          stats.errors.push(`Failed to delete orphaned file ${fileKey}: ${error}`);
        }
      }

    } catch (error) {
      stats.errors.push(`Cleanup failed: ${error}`);
    }

    return stats;
  }

  /**
   * Identify reports that should be deleted based on retention policy
   */
  private identifyReportsForDeletion(
    reports: any[],
    policy: RetentionPolicy
  ): any[] {
    const reportsToDelete: any[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.maxAgeInDays);

    // Sort by generation date (newest first)
    reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());

    // Group by configuration to apply per-configuration limits
    const reportsByConfig = reports.reduce((acc, report) => {
      const configId = report.configurationId;
      if (!acc[configId]) acc[configId] = [];
      acc[configId].push(report);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [configId, configReports] of Object.entries(reportsByConfig)) {
      const typedConfigReports = configReports as any[];
      
      // Rule 1: Delete reports older than maxAgeInDays
      const oldReports = typedConfigReports.filter(
        (report: any) => new Date(report.generatedAt) < cutoffDate
      );
      reportsToDelete.push(...oldReports);

      // Rule 2: Keep only maxReportsPerConfiguration most recent reports
      const recentReports = typedConfigReports.filter(
        (report: any) => new Date(report.generatedAt) >= cutoffDate
      );
      
      if (recentReports.length > policy.maxReportsPerConfiguration) {
        const excessReports = recentReports.slice(policy.maxReportsPerConfiguration);
        reportsToDelete.push(...excessReports);
      }
    }

    // Rule 3: If total size exceeds limit, delete oldest reports first
    const totalSize = reports.reduce((sum, report) => sum + report.fileSize, 0);
    if (totalSize > policy.maxTotalSizeInMB) {
      const sortedByAge = reports
        .filter(report => !reportsToDelete.includes(report))
        .sort((a, b) => new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime());

      let currentSize = totalSize;
      for (const report of sortedByAge) {
        if (currentSize <= policy.maxTotalSizeInMB) break;
        reportsToDelete.push(report);
        currentSize -= report.fileSize;
      }
    }

    return Array.from(new Set(reportsToDelete)); // Remove duplicates
  }

  /**
   * Delete a specific report and its associated file
   */
  public async deleteReport(companyId: string, reportId: string): Promise<void> {
    // Get report details
    const report = await prisma.generatedReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    // Delete file from S3
    const s3Key = `reports/${reportId}/`;
    try {
      // List all files in the report directory
      const files = await this.s3Service.listFiles(companyId, s3Key);
      
      // Delete each file
      for (const file of files) {
        if (file.Key) {
          const fileKey = file.Key.replace(`companies/${companyId}/`, '');
          await this.s3Service.deleteFile(companyId, fileKey);
        }
      }
    } catch (s3Error) {
      console.warn(`S3 deletion warning for report ${reportId}:`, s3Error);
      // Continue with database deletion even if S3 fails
    }

    // Delete from database (will cascade to related records)
    await prisma.generatedReport.delete({
      where: { id: reportId },
    });
  }

  /**
   * Delete all reports for a specific configuration
   */
  public async deleteReportsForConfiguration(configurationId: string): Promise<CleanupStats> {
    const stats: CleanupStats = {
      deletedReports: 0,
      deletedFiles: 0,
      freedSpace: 0,
      errors: [],
    };

    try {
      const reports = await prisma.generatedReport.findMany({
        where: { configurationId },
        include: { configuration: true },
      });

      for (const report of reports) {
        try {
          await this.deleteReport(report.companyId, report.id);
          stats.deletedReports++;
          stats.freedSpace += report.fileSize;
        } catch (error) {
          stats.errors.push(`Failed to delete report ${report.id}: ${error}`);
        }
      }
    } catch (error) {
      stats.errors.push(`Failed to delete reports for configuration ${configurationId}: ${error}`);
    }

    return stats;
  }

  /**
   * Delete all reports for a company (used when company is deleted)
   */
  public async deleteAllCompanyReports(companyId: string): Promise<CleanupStats> {
    const stats: CleanupStats = {
      deletedReports: 0,
      deletedFiles: 0,
      freedSpace: 0,
      errors: [],
    };

    try {
      // Get total size for stats
      const reports = await prisma.generatedReport.findMany({
        where: { companyId },
        select: { fileSize: true },
      });
      
      stats.freedSpace = reports.reduce((sum, report) => sum + report.fileSize, 0);

      // Delete all S3 files for the company's reports
      try {
        const reportFiles = await this.s3Service.listFiles(companyId, 'reports/');
        stats.deletedFiles = reportFiles.length;
        
        // Delete the entire reports directory for the company
        for (const file of reportFiles) {
          if (file.Key) {
            const fileKey = file.Key.replace(`companies/${companyId}/`, '');
            await this.s3Service.deleteFile(companyId, fileKey);
          }
        }
      } catch (s3Error) {
        stats.errors.push(`S3 cleanup error: ${s3Error}`);
      }

      // Delete from database (CASCADE will handle related records)
      const deleteResult = await prisma.generatedReport.deleteMany({
        where: { companyId },
      });
      
      stats.deletedReports = deleteResult.count;

    } catch (error) {
      stats.errors.push(`Failed to delete company reports: ${error}`);
    }

    return stats;
  }

  /**
   * Find orphaned files in S3 that don't have corresponding database records
   */
  private async findOrphanedFiles(companyId: string): Promise<string[]> {
    const orphanedFiles: string[] = [];

    try {
      // Get all report files from S3
      const s3Files = await this.s3Service.listFiles(companyId, 'reports/');
      
      // Get all report IDs from database
      const dbReports = await prisma.generatedReport.findMany({
        where: { companyId },
        select: { id: true },
      });
      
      const dbReportIds = new Set(dbReports.map(r => r.id));

      // Check each S3 file
      for (const file of s3Files) {
        if (!file.Key) continue;
        
        // Extract report ID from path: companies/{companyId}/reports/{reportId}/filename
        const pathParts = file.Key.split('/');
        const reportIdIndex = pathParts.findIndex(part => part === 'reports') + 1;
        
        if (reportIdIndex > 0 && reportIdIndex < pathParts.length) {
          const reportId = pathParts[reportIdIndex];
          
          if (!dbReportIds.has(reportId)) {
            // This file is orphaned
            const fileKey = file.Key.replace(`companies/${companyId}/`, '');
            orphanedFiles.push(fileKey);
          }
        }
      }
    } catch (error) {
      console.error('Error finding orphaned files:', error);
    }

    return orphanedFiles;
  }

  /**
   * Get storage statistics for a company
   */
  public async getStorageStats(companyId: string): Promise<{
    totalReports: number;
    totalSizeInMB: number;
    reportsByFormat: Record<string, { count: number; sizeInMB: number }>;
    oldestReport: Date | null;
    newestReport: Date | null;
  }> {
    const reports = await prisma.generatedReport.findMany({
      where: { companyId },
      select: {
        format: true,
        fileSize: true,
        generatedAt: true,
      },
      orderBy: { generatedAt: 'asc' },
    });

    const stats = {
      totalReports: reports.length,
      totalSizeInMB: reports.reduce((sum, r) => sum + r.fileSize, 0),
      reportsByFormat: {} as Record<string, { count: number; sizeInMB: number }>,
      oldestReport: reports.length > 0 ? reports[0].generatedAt : null,
      newestReport: reports.length > 0 ? reports[reports.length - 1].generatedAt : null,
    };

    // Group by format
    for (const report of reports) {
      const format = report.format.toLowerCase();
      if (!stats.reportsByFormat[format]) {
        stats.reportsByFormat[format] = { count: 0, sizeInMB: 0 };
      }
      stats.reportsByFormat[format].count++;
      stats.reportsByFormat[format].sizeInMB += report.fileSize;
    }

    return stats;
  }
}

export default ReportCleanupService; 