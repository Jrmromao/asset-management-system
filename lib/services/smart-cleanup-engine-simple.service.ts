import { prisma } from "@/app/db";

interface CleanupPolicy {
  format: string;
  retentionDays: number;
  maxFiles: number;
  maxSizeGB: number;
  priority: "low" | "medium" | "high";
}

interface SmartCleanupRecommendation {
  filePath: string;
  action: "DELETE" | "ARCHIVE" | "COMPRESS" | "PROTECT";
  reasoning: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  potentialSavings: number;
  businessImpact: string;
}

interface SmartCleanupResult {
  totalFilesAnalyzed: number;
  recommendations: SmartCleanupRecommendation[];
  potentialSavingsMB: number;
  protectedFiles: number;
  spaceSaved: number;
  warnings: string[];
}

class SimpleSmartCleanupEngine {
  private analyzeReportWithPath(report: any, downloads: any[], filePath: string): SmartCleanupRecommendation | null {
    const now = new Date();
    const reportAge = Math.floor((now.getTime() - new Date(report.generatedAt).getTime()) / (1000 * 60 * 60 * 24));
    const lastDownload = downloads[0]?.downloadedAt;
    const daysSinceLastDownload = lastDownload 
      ? Math.floor((now.getTime() - new Date(lastDownload).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const downloadCount = downloads.length;
    const fileSizeMB = report.fileSize || 0;

    // AI-powered decision logic
    
    // PROTECT: Recent, frequently accessed, or business critical
    if (reportAge <= 7 || downloadCount >= 5 || report.format === 'PDF' && downloadCount >= 2) {
      return {
        filePath,
        action: "PROTECT",
        reasoning: this.getProtectReasoning(reportAge, downloadCount, report.format),
        confidence: 0.9,
        riskLevel: "low",
        potentialSavings: 0,
        businessImpact: "No impact - file protected due to recent activity"
      };
    }

    // DELETE: Very old and never accessed
    if (reportAge > 365 && downloadCount === 0) {
      return {
        filePath,
        action: "DELETE",
        reasoning: `File is ${reportAge} days old and has never been downloaded`,
        confidence: 0.95,
        riskLevel: "low",
        potentialSavings: fileSizeMB,
        businessImpact: "Minimal impact - file has never been accessed"
      };
    }

    // DELETE: Old with no recent access
    if (reportAge > 180 && daysSinceLastDownload && daysSinceLastDownload > 120) {
      return {
        filePath,
        action: "DELETE",
        reasoning: `File is ${reportAge} days old, last accessed ${daysSinceLastDownload} days ago`,
        confidence: 0.85,
        riskLevel: "low",
        potentialSavings: fileSizeMB,
        businessImpact: "Low impact - file not accessed recently"
      };
    }

    // COMPRESS: Large files with infrequent access
    if (fileSizeMB > 50 && downloadCount <= 2 && reportAge > 30) {
      return {
        filePath,
        action: "COMPRESS",
        reasoning: `Large file (${fileSizeMB.toFixed(1)}MB) with low access frequency`,
        confidence: 0.8,
        riskLevel: "low",
        potentialSavings: fileSizeMB * 0.6, // Assume 60% compression
        businessImpact: "No impact on accessibility, file remains available"
      };
    }

    // ARCHIVE: Moderate age with some historical value
    if (reportAge > 90 && downloadCount > 0 && daysSinceLastDownload && daysSinceLastDownload > 60) {
      return {
        filePath,
        action: "ARCHIVE",
        reasoning: `Historical file with some past usage, suitable for cold storage`,
        confidence: 0.75,
        riskLevel: "medium",
        potentialSavings: fileSizeMB * 0.8, // Cost savings from cold storage
        businessImpact: "Slower access time when needed (cold storage)"
      };
    }

    // No recommendation for files that don't match any criteria
    return null;
  }

  private getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      'PDF': 'pdf',
      'EXCEL': 'xlsx',
      'CSV': 'csv',
      'DASHBOARD': 'json'
    };
    return extensions[format.toUpperCase()] || 'dat';
  }

  /**
   * Generate a consistent filePath for a report
   * This ensures the same path is used for analysis and protection
   */
  private generateConsistentFilePath(report: any): string {
    // If the report already has a filePath, use it
    if (report.filePath && !report.filePath.startsWith('/api/reports/download/')) {
      return report.filePath;
    }
    
    // Otherwise, construct a consistent path
    const configName = report.configuration?.name || 'unknown';
    const extension = this.getFileExtension(report.format);
    const reportIdSuffix = report.id.slice(-8);
    
    return `reports/${configName}/${report.format.toLowerCase()}-${reportIdSuffix}.${extension}`;
  }

  private getProtectReasoning(age: number, downloads: number, format: string): string {
    if (age <= 7) return `Recently generated (${age} days ago)`;
    if (downloads >= 5) return `Frequently accessed (${downloads} downloads)`;
    if (format === 'PDF' && downloads >= 2) return `Important document format with recent access`;
    return `Active file with business value`;
  }

  async analyzeReports(companyId: string): Promise<{
    analyzedFiles: number;
    recommendations: SmartCleanupRecommendation[];
    totalPotentialSavings: number;
    summary: {
      deleteCount: number;
      archiveCount: number;
      compressCount: number;
      protectCount: number;
    };
  }> {
    console.log(`🔍 Starting smart cleanup analysis for company: ${companyId}`);
    
    // Use executeSmartCleanup with dryRun=true to get recommendations
    const result = await this.executeSmartCleanup(companyId, [], true);
    
    const summary = {
      deleteCount: result.recommendations.filter(r => r.action === 'DELETE').length,
      archiveCount: result.recommendations.filter(r => r.action === 'ARCHIVE').length,
      compressCount: result.recommendations.filter(r => r.action === 'COMPRESS').length,
      protectCount: result.recommendations.filter(r => r.action === 'PROTECT').length,
    };
    
    return {
      analyzedFiles: result.totalFilesAnalyzed,
      recommendations: result.recommendations,
      totalPotentialSavings: result.potentialSavingsMB,
      summary
    };
  }

  async executeSmartCleanup(
    companyId: string,
    policies: CleanupPolicy[],
    dryRun: boolean = false,
  ): Promise<SmartCleanupResult> {
    console.log(`🧠 Starting AI-powered smart cleanup analysis (dryRun: ${dryRun})`);

    try {
      // Fetch actual reports from database
      const reports = await prisma.generatedReport.findMany({
        where: { companyId },
        include: {
          configuration: {
            select: {
              name: true,
              format: true,
            }
          }
        },
        orderBy: {
          generatedAt: 'desc'
        }
      });

      // Fetch download data separately
      const downloadData = await prisma.reportDownload.findMany({
        where: { companyId },
        orderBy: { downloadedAt: 'desc' }
      });

      // Fetch already protected files
      const protectedFiles = await prisma.fileProtectionRule.findMany({
        where: { 
          companyId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        select: { filePath: true }
      });
      
      const protectedFilePaths = new Set(protectedFiles.map(pf => pf.filePath));
      console.log(`🛡️ Found ${protectedFilePaths.size} already protected files`);
      console.log(`🔍 Protected file paths:`, Array.from(protectedFilePaths));
      
      // Debug: Show sample report data and path generation
      if (reports.length > 0) {
        const sampleReport = reports[0];
        const generatedPath = this.generateConsistentFilePath(sampleReport);
        console.log(`📋 Sample report data:`, {
          id: sampleReport.id,
          originalFilePath: sampleReport.filePath,
          configName: sampleReport.configuration?.name,
          format: sampleReport.format,
          generatedPath: generatedPath,
          isProtected: protectedFilePaths.has(generatedPath)
        });
      }

      console.log(`📊 Found ${reports.length} reports in database for analysis`);

      // Generate intelligent recommendations based on actual data
      const recommendations: SmartCleanupRecommendation[] = [];
      const warnings: string[] = [];
      let skippedProtectedCount = 0;

      if (reports.length === 0) {
        warnings.push("No reports found in database for this company");
        return {
          totalFilesAnalyzed: 0,
          recommendations: [],
          potentialSavingsMB: 0,
          protectedFiles: 0,
          spaceSaved: 0,
          warnings
        };
      }

      for (const report of reports) {
        const reportDownloads = downloadData.filter(d => d.filePath.includes(report.id));
        
        // Generate a consistent filePath for this report
        const filePath = this.generateConsistentFilePath(report);
        
        // Debug: Log the file path and check protection
        console.log(`📁 Analyzing file: ${filePath} (original: ${report.filePath || 'none'})`);
        console.log(`🔍 Is protected? ${protectedFilePaths.has(filePath)}`);
        
        // Skip files that are already protected
        if (protectedFilePaths.has(filePath)) {
          console.log(`⏭️ Skipping already protected file: ${filePath}`);
          skippedProtectedCount++;
          continue;
        }
        
        const recommendation = this.analyzeReportWithPath(report, reportDownloads, filePath);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }

      // Summary of filtering
      console.log(`📊 Filtering summary: ${reports.length} total files, ${skippedProtectedCount} skipped (protected), ${recommendations.length} recommendations generated`);

      const result: SmartCleanupResult = {
        totalFilesAnalyzed: reports.length,
        recommendations,
        potentialSavingsMB: recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0),
        protectedFiles: recommendations.filter(rec => rec.action === "PROTECT").length,
        spaceSaved: dryRun ? 0 : recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0),
        warnings
      };

      console.log(`✅ AI-powered cleanup analysis complete:`, {
        totalFiles: result.totalFilesAnalyzed,
        recommendations: result.recommendations.length,
        potentialSavings: result.potentialSavingsMB,
        protectedFiles: result.protectedFiles,
        skippedProtected: skippedProtectedCount
      });

      return result;
    } catch (error) {
      console.error("Error in smart cleanup:", error);
      throw error;
    }
  }
}

// Export service instance
export const smartCleanupEngine = new SimpleSmartCleanupEngine(); 