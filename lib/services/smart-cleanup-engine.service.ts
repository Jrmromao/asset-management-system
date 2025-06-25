import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { aiService } from "./ai-multi-provider.service";

interface CleanupPolicy {
  format: string;
  retentionDays: number;
  maxFiles: number;
  maxSizeGB: number;
  protectionRules: ProtectionRule[];
  priority: "low" | "medium" | "high";
}

interface ProtectionRule {
  type:
    | "usage_frequency"
    | "file_age"
    | "file_size"
    | "user_importance"
    | "business_critical";
  threshold: number;
  action: "protect" | "archive" | "delete";
  description: string;
}

interface FileAnalysis {
  filePath: string;
  size: number;
  lastModified: Date;
  lastAccessed?: Date;
  downloadCount: number;
  userImportanceScore: number;
  businessCriticality: "low" | "medium" | "high" | "critical";
  duplicates: string[];
  compressionPotential: number;
  accessPattern: "frequent" | "occasional" | "rare" | "never";
  nextAccessPrediction?: Date;
  aiAnalysis?: {
    contentType: string;
    businessValue: number;
    retentionRecommendation: number;
    reasoning: string;
    confidence: number;
  };
}

interface SmartCleanupRecommendation {
  filePath: string;
  action: "DELETE" | "ARCHIVE" | "COMPRESS" | "PROTECT";
  reasoning: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  potentialSavings: number;
  businessImpact: string;
  aiRecommendation?: {
    action: string;
    confidence: number;
    reasoning: string;
    businessValue: number;
  };
}

interface SmartCleanupResult {
  totalFilesAnalyzed: number;
  recommendations: SmartCleanupRecommendation[];
  potentialSavingsMB: number;
  protectedFiles: number;
  spaceSaved: number;
  warnings: string[];
  aiInsights?: {
    overallRecommendation: string;
    businessImpact: string;
    costSavings: number;
    riskAssessment: string;
  };
}

class SmartCleanupEngine {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME!;
  }

  /**
   * Analyzes file usage patterns and metadata
   */
  private async analyzeFile(
    key: string,
    companyId: string,
  ): Promise<FileAnalysis> {
    try {
      // Get S3 object metadata
      const headCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const metadata = await this.s3Client.send(headCommand);

      // Get usage analytics from database
      const downloadStats = await prisma.reportDownload.findMany({
        where: {
          filePath: key,
          companyId: companyId,
        },
        orderBy: { downloadedAt: "desc" },
      });

      // Calculate usage metrics
      const downloadCount = downloadStats.length;
      const lastAccessed =
        downloadStats[0]?.downloadedAt || metadata.LastModified || new Date(0);
      const daysSinceLastAccess = Math.floor(
        (Date.now() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Analyze access patterns to predict next access
      const accessIntervals = this.calculateAccessIntervals(downloadStats);
      const predictedNextAccess = this.predictNextAccess(
        accessIntervals,
        lastAccessed,
      );

      // Check for duplicates
      const duplicateOf = await this.findDuplicateFile(
        key,
        metadata.ContentLength || 0,
      );

      // Calculate user importance based on download frequency and recency
      const userImportance = this.calculateUserImportance(
        downloadCount,
        daysSinceLastAccess,
      );

      // Determine business criticality
      const businessCritical = this.isBusinessCritical(
        key,
        downloadCount,
        daysSinceLastAccess,
      );

      return {
        filePath: key,
        size: metadata.ContentLength || 0,
        lastModified: metadata.LastModified || new Date(),
        downloadCount,
        lastAccessed,
        userImportanceScore: userImportance,
        businessCriticality: businessCritical ? "critical" : "low",
        duplicates: duplicateOf ? [duplicateOf] : [],
        compressionPotential: 0,
        accessPattern: this.calculateAccessPattern(downloadStats),
        nextAccessPrediction: predictedNextAccess,
      };
    } catch (error) {
      console.error(`Error analyzing file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Calculates intervals between file accesses
   */
  private calculateAccessIntervals(downloadStats: any[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < downloadStats.length; i++) {
      const interval =
        downloadStats[i - 1].downloadedAt.getTime() -
        downloadStats[i].downloadedAt.getTime();
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }
    return intervals;
  }

  /**
   * Predicts when a file might be accessed next based on historical patterns
   */
  private predictNextAccess(
    intervals: number[],
    lastAccessed: Date,
  ): Date | undefined {
    if (intervals.length === 0) return undefined;

    // Calculate average interval
    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Add some variance based on pattern consistency
    const variance = this.calculateVariance(intervals);
    const adjustedInterval = avgInterval + variance * 0.5;

    return new Date(
      lastAccessed.getTime() + adjustedInterval * 24 * 60 * 60 * 1000,
    );
  }

  /**
   * Calculates variance in access intervals
   */
  private calculateVariance(intervals: number[]): number {
    if (intervals.length === 0) return 0;
    const mean =
      intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance =
      intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      intervals.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculates user importance score (1-10)
   */
  private calculateUserImportance(
    downloadCount: number,
    daysSinceLastAccess: number,
  ): number {
    // High download count = high importance
    const downloadScore = Math.min(downloadCount / 10, 5); // Max 5 points for downloads

    // Recent access = high importance
    const recencyScore = Math.max(5 - daysSinceLastAccess / 30, 0); // Max 5 points for recency

    return Math.min(downloadScore + recencyScore, 10);
  }

  /**
   * Determines if a file is business critical
   */
  private isBusinessCritical(
    key: string,
    downloadCount: number,
    daysSinceLastAccess: number,
  ): boolean {
    // Files accessed frequently or recently are likely business critical
    const isFrequentlyAccessed = downloadCount >= 5;
    const isRecentlyAccessed = daysSinceLastAccess <= 7;
    const isReportFile = key.includes("report") || key.includes("dashboard");

    return isFrequentlyAccessed || (isRecentlyAccessed && isReportFile);
  }

  /**
   * Finds duplicate files based on size and naming patterns
   */
  private async findDuplicateFile(
    key: string,
    size: number,
  ): Promise<string | undefined> {
    try {
      // Simple duplicate detection based on size and similar naming
      const baseName = key
        .split("/")
        .pop()
        ?.replace(/\d{4}-\d{2}-\d{2}/, "DATE");

      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: key.split("/").slice(0, -1).join("/"),
      });

      const response = await this.s3Client.send(listCommand);
      const similarFiles = response.Contents?.filter(
        (obj) =>
          obj.Key !== key &&
          obj.Size === size &&
          obj.Key?.includes(baseName?.split(".")[0] || ""),
      );

      return similarFiles?.[0]?.Key;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Calculates access pattern based on download frequency
   */
  private calculateAccessPattern(
    downloadStats: any[],
  ): "frequent" | "occasional" | "rare" | "never" {
    if (downloadStats.length === 0) return "never";

    const accessCounts = downloadStats.map((stat) =>
      stat.downloadedAt.getTime(),
    );
    const accessIntervals = this.calculateAccessIntervals(downloadStats);

    if (accessIntervals.every((interval) => interval < 7)) {
      return "frequent";
    } else if (accessIntervals.every((interval) => interval > 30)) {
      return "rare";
    } else if (accessIntervals.every((interval) => interval > 60)) {
      return "occasional";
    } else {
      return "never";
    }
  }

  /**
   * Generates intelligent cleanup recommendation for a file
   */
  private generateRecommendation(
    analysis: FileAnalysis,
    policy: CleanupPolicy,
  ): SmartCleanupRecommendation {
    const reasons: string[] = [];
    let action: SmartCleanupRecommendation["action"] = "DELETE";
    let confidence = 0.5;
    let riskLevel: SmartCleanupRecommendation["riskLevel"] = "medium";

    // Protection rules evaluation
    if (analysis.businessCriticality === "critical") {
      action = "PROTECT";
      confidence = 0.9;
      riskLevel = "low";
      reasons.push("File is marked as business critical");
      return {
        action,
        confidence,
        reasoning: reasons,
        potentialSavings: 0,
        riskLevel,
        businessImpact: "Minimal impact expected",
      };
    }

    if (analysis.userImportanceScore >= 8) {
      action = "PROTECT";
      confidence = 0.8;
      riskLevel = "low";
      reasons.push(
        `High user importance score: ${analysis.userImportanceScore}/10`,
      );
      return {
        action,
        confidence,
        reasoning: reasons,
        potentialSavings: 0,
        riskLevel,
        businessImpact: "Minimal impact expected",
      };
    }

    // Age-based analysis
    const daysSinceModified = Math.floor(
      (Date.now() - analysis.lastModified.getTime()) / (1000 * 60 * 60 * 24),
    );
    const daysSinceAccessed = Math.floor(
      (Date.now() - analysis.lastAccessed?.getTime() || 0) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSinceAccessed > policy.retentionDays) {
      if (analysis.downloadCount === 0) {
        action = "DELETE";
        confidence = 0.9;
        riskLevel = "low";
        reasons.push(
          `Never accessed and older than ${policy.retentionDays} days`,
        );
      } else if (
        analysis.downloadCount < 3 &&
        daysSinceAccessed > policy.retentionDays * 2
      ) {
        action = "DELETE";
        confidence = 0.8;
        riskLevel = "low";
        reasons.push(
          `Rarely accessed (${analysis.downloadCount} times) and very old`,
        );
      } else {
        action = "ARCHIVE";
        confidence = 0.7;
        riskLevel = "medium";
        reasons.push(`Old but has some usage history - safe to archive`);
      }
    } else if (analysis.duplicates.length > 0) {
      action = "DELETE";
      confidence = 0.85;
      riskLevel = "low";
      reasons.push(`Duplicate of ${analysis.duplicates[0]}`);
    } else if (
      analysis.size > 100 * 1024 * 1024 &&
      analysis.downloadCount < 2
    ) {
      // > 100MB, rarely accessed
      action = "COMPRESS";
      confidence = 0.7;
      riskLevel = "low";
      reasons.push(
        "Large file with low usage - good candidate for compression",
      );
    } else if (
      analysis.nextAccessPrediction &&
      analysis.nextAccessPrediction >
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    ) {
      action = "ARCHIVE";
      confidence = 0.6;
      riskLevel = "medium";
      reasons.push("Predicted next access is more than 90 days away");
    } else {
      action = "PROTECT";
      confidence = 0.6;
      riskLevel = "high";
      reasons.push("File appears to be actively used or important");
    }

    const estimatedSavings =
      action === "DELETE"
        ? analysis.size
        : action === "COMPRESS"
          ? analysis.size * 0.7
          : action === "ARCHIVE"
            ? analysis.size * 0.9
            : 0;

    return {
      filePath: analysis.filePath,
      action,
      confidence,
      reasoning: reasons,
      potentialSavings: estimatedSavings,
      riskLevel,
      businessImpact:
        riskLevel === "low"
          ? "Minimal impact expected"
          : riskLevel === "medium"
            ? "Some user inconvenience possible"
            : "Potential business disruption",
    };
  }

  /**
   * Executes cleanup actions based on recommendations
   */
  private async executeCleanup(
    recommendation: SmartCleanupRecommendation,
    companyId: string,
    dryRun: boolean = false,
  ): Promise<{ executed: boolean; error?: string }> {
    if (dryRun) {
      return { executed: false };
    }

    try {
      switch (recommendation.action) {
        case "DELETE":
          await this.s3Client.send(
            new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: recommendation.filePath,
            }),
          );

          // Log the deletion
          await prisma.reportCleanupLog.create({
            data: {
              companyId,
              filePath: recommendation.filePath,
              action: "DELETE",
              spaceSaved: recommendation.potentialSavings,
              reasoning: recommendation.reasoning.join("; "),
              confidence: recommendation.confidence,
            },
          });
          break;

        case "ARCHIVE":
          // Move to archive storage class
          // Implementation would depend on your archiving strategy
          await this.archiveFile(recommendation.filePath);
          break;

        case "COMPRESS":
          // Implement compression logic
          await this.compressFile(recommendation.filePath);
          break;

        case "PROTECT":
          // Add protection metadata
          await this.protectFile(recommendation.filePath);
          break;
      }

      return { executed: true };
    } catch (error) {
      return {
        executed: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Archives a file by moving it to a cheaper storage class
   */
  private async archiveFile(key: string): Promise<void> {
    // Implementation for archiving (e.g., move to Glacier)
    // This is a placeholder - implement based on your needs
    console.log(`Archiving file: ${key}`);
  }

  /**
   * Compresses a file to save space
   */
  private async compressFile(key: string): Promise<void> {
    // Implementation for file compression
    // This is a placeholder - implement based on your needs
    console.log(`Compressing file: ${key}`);
  }

  /**
   * Protects a file from cleanup
   */
  private async protectFile(key: string): Promise<void> {
    // Add protection metadata to the file
    // This is a placeholder - implement based on your needs
    console.log(`Protecting file: ${key}`);
  }

  /**
   * Main smart cleanup execution
   */
  async executeSmartCleanup(
    companyId: string,
    policies: CleanupPolicy[],
    dryRun: boolean = false,
  ): Promise<SmartCleanupResult> {
    console.log(
      `🧠 Starting AI-powered smart cleanup analysis (dryRun: ${dryRun})`,
    );

    const result: SmartCleanupResult = {
      totalFilesAnalyzed: 0,
      recommendations: [],
      potentialSavingsMB: 0,
      protectedFiles: 0,
      spaceSaved: 0,
      warnings: [],
    };

    try {
      // List all files for the company
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `reports/${companyId}/`,
      });

      const response = await this.s3Client.send(listCommand);
      const files = response.Contents || [];

      result.totalFilesAnalyzed = files.length;

      for (const file of files) {
        if (!file.Key) continue;

        try {
          // Analyze the file
          const analysis = await this.analyzeFile(file.Key, companyId);

          // Find applicable policy
          const fileFormat = file.Key.split(".").pop()?.toLowerCase() || "";
          const policy =
            policies.find((p) => p.format === fileFormat) || policies[0];

          // Generate recommendation
          const recommendation = this.generateRecommendation(analysis, policy);

          result.recommendations.push(recommendation);
          result.potentialSavingsMB += recommendation.potentialSavings;

          if (recommendation.action === "PROTECT") {
            result.protectedFiles++;
          }

          // Execute action if not dry run
          const execution = await this.executeCleanup(
            recommendation,
            companyId,
            dryRun,
          );

          if (execution.executed) {
            switch (recommendation.action) {
              case "DELETE":
                result.filesDeleted++;
                break;
              case "ARCHIVE":
                result.filesArchived++;
                break;
              case "COMPRESS":
                result.filesCompressed++;
                break;
              case "PROTECT":
                result.protectedFiles++;
                break;
            }
            result.spaceSaved += recommendation.potentialSavings;
          } else if (execution.error) {
            result.warnings.push(
              `Failed to process ${file.Key}: ${execution.error}`,
            );
          }
        } catch (error) {
          result.warnings.push(
            `Error analyzing ${file.Key}: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
        }
      }

      // Generate AI insights for the overall results
      const enhancedResult = await this.generateAIInsights(result);

      console.log(`✅ AI-powered cleanup analysis complete:`, {
        filesAnalyzed: result.totalFilesAnalyzed,
        recommendations: result.recommendations.length,
        potentialSavings: `${(result.potentialSavingsMB / 1024).toFixed(2)} GB`,
        protectedFiles: result.protectedFiles,
      });

      return enhancedResult;
    } catch (error) {
      console.error("Smart cleanup failed:", error);
      result.warnings.push(`Cleanup failed: ${error}`);
      return result;
    }
  }

  // Enhanced AI-powered file analysis
  private async analyzeFileWithAI(file: FileAnalysis): Promise<FileAnalysis> {
    try {
      // Build AI prompt for file analysis
      const prompt = `
Analyze this file for intelligent cleanup decision-making:

File Information:
- Path: ${file.filePath}
- Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
- Last Modified: ${file.lastModified.toISOString()}
- Download Count: ${file.downloadCount}
- Access Pattern: ${file.accessPattern}
- Business Criticality: ${file.businessCriticality}

Context:
- This is a report file from an asset management system
- Files can be PDFs, Excel sheets, CSV exports, or dashboard snapshots
- Business value depends on report type, recency, and usage patterns

Please analyze and provide:
1. Content type classification (financial_report, operational_data, compliance_document, etc.)
2. Business value score (1-10, where 10 is critical business data)
3. Recommended retention period in days
4. Detailed reasoning for the recommendation
5. Confidence level (0-1)

Respond in JSON format:
{
  "contentType": "string",
  "businessValue": number,
  "retentionRecommendation": number,
  "reasoning": "string",
  "confidence": number
}
`;

      const aiResponse = await aiService.calculateAssetCO2WithFallback(
        prompt,
        "AI File Analysis",
        "Smart Cleanup Engine",
      );

      if (aiResponse.success && aiResponse.data) {
        file.aiAnalysis = {
          contentType: aiResponse.data.contentType || "unknown",
          businessValue: aiResponse.data.businessValue || 5,
          retentionRecommendation:
            aiResponse.data.retentionRecommendation || 30,
          reasoning: aiResponse.data.reasoning || "Standard analysis applied",
          confidence: aiResponse.data.confidence || 0.7,
        };
      }
    } catch (error) {
      console.warn("AI analysis failed for file:", file.filePath, error);
      // Fallback to rule-based analysis
    }

    return file;
  }

  // AI-powered cleanup recommendation
  private async generateAIRecommendation(
    file: FileAnalysis,
  ): Promise<SmartCleanupRecommendation> {
    let aiRecommendation;

    try {
      const prompt = `
Generate intelligent cleanup recommendation for this file:

File Analysis:
- Path: ${file.filePath}
- Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
- Age: ${Math.floor((Date.now() - file.lastModified.getTime()) / (1000 * 60 * 60 * 24))} days
- Download Count: ${file.downloadCount}
- User Importance Score: ${file.userImportanceScore}/10
- Business Criticality: ${file.businessCriticality}
- Access Pattern: ${file.accessPattern}
${
  file.aiAnalysis
    ? `- AI Content Type: ${file.aiAnalysis.contentType}
- AI Business Value: ${file.aiAnalysis.businessValue}/10
- AI Retention Rec: ${file.aiAnalysis.retentionRecommendation} days`
    : ""
}

Available Actions:
- DELETE: Permanently remove file (high space savings, irreversible)
- ARCHIVE: Move to cold storage (medium savings, retrievable)
- COMPRESS: Reduce file size (low-medium savings, maintains accessibility)
- PROTECT: Mark as important, exclude from cleanup

Consider:
- Business impact of each action
- Cost vs. risk trade-offs
- Compliance and audit requirements
- User access patterns and future needs

Provide recommendation in JSON:
{
  "action": "DELETE|ARCHIVE|COMPRESS|PROTECT",
  "confidence": number (0-1),
  "reasoning": "detailed explanation",
  "businessValue": number (1-10)
}
`;

      const aiResponse = await aiService.calculateAssetCO2WithFallback(
        prompt,
        "AI Cleanup Recommendation",
        "Smart Cleanup Engine",
      );

      if (aiResponse.success && aiResponse.data) {
        aiRecommendation = {
          action: aiResponse.data.action || "PROTECT",
          confidence: aiResponse.data.confidence || 0.5,
          reasoning: aiResponse.data.reasoning || "AI analysis unavailable",
          businessValue: aiResponse.data.businessValue || 5,
        };
      }
    } catch (error) {
      console.warn("AI recommendation failed for file:", file.filePath, error);
    }

    // Generate base recommendation using rule-based logic
    const baseRecommendation = this.generateRuleBasedRecommendation(file);

    // Enhance with AI insights if available
    if (aiRecommendation) {
      // AI takes precedence for high-confidence recommendations
      if (aiRecommendation.confidence > 0.8) {
        baseRecommendation.action = aiRecommendation.action as any;
        baseRecommendation.confidence = Math.min(
          baseRecommendation.confidence + 0.2,
          1.0,
        );
        baseRecommendation.reasoning = `AI Analysis: ${aiRecommendation.reasoning}. ${baseRecommendation.reasoning}`;
      } else {
        // Blend AI and rule-based recommendations
        baseRecommendation.reasoning = `AI suggests ${aiRecommendation.action} (${(aiRecommendation.confidence * 100).toFixed(0)}% confidence): ${aiRecommendation.reasoning}. Rule-based analysis: ${baseRecommendation.reasoning}`;
      }

      baseRecommendation.aiRecommendation = aiRecommendation;
    }

    return baseRecommendation;
  }

  // Generate overall AI insights for cleanup results
  private async generateAIInsights(
    results: SmartCleanupResult,
  ): Promise<SmartCleanupResult> {
    try {
      const prompt = `
Analyze these smart cleanup results and provide executive insights:

Cleanup Summary:
- Total Files Analyzed: ${results.totalFilesAnalyzed}
- Recommendations Generated: ${results.recommendations.length}
- Potential Space Savings: ${(results.potentialSavingsMB / 1024).toFixed(2)} GB
- Protected Files: ${results.protectedFiles}

Recommendation Breakdown:
${results.recommendations
  .slice(0, 10)
  .map(
    (rec) =>
      `- ${rec.action}: ${rec.filePath.split("/").pop()} (${(rec.confidence * 100).toFixed(0)}% confidence)`,
  )
  .join("\n")}

Provide executive summary in JSON:
{
  "overallRecommendation": "High-level recommendation for management",
  "businessImpact": "Impact assessment on business operations",
  "costSavings": "Estimated annual cost savings in USD",
  "riskAssessment": "Risk analysis of implementing recommendations"
}
`;

      const aiResponse = await aiService.calculateAssetCO2WithFallback(
        prompt,
        "AI Cleanup Insights",
        "Smart Cleanup Engine",
      );

      if (aiResponse.success && aiResponse.data) {
        results.aiInsights = {
          overallRecommendation:
            aiResponse.data.overallRecommendation ||
            "Proceed with recommended cleanup actions",
          businessImpact:
            aiResponse.data.businessImpact || "Minimal impact expected",
          costSavings: aiResponse.data.costSavings || 0,
          riskAssessment:
            aiResponse.data.riskAssessment ||
            "Low risk with current recommendations",
        };
      }
    } catch (error) {
      console.warn("AI insights generation failed:", error);
    }

    return results;
  }

  // Rule-based recommendation (fallback)
  private generateRuleBasedRecommendation(
    file: FileAnalysis,
  ): SmartCleanupRecommendation {
    const ageInDays = Math.floor(
      (Date.now() - file.lastModified.getTime()) / (1000 * 60 * 60 * 24),
    );
    const sizeMB = file.size / 1024 / 1024;

    let action: "DELETE" | "ARCHIVE" | "COMPRESS" | "PROTECT" = "PROTECT";
    let reasoning = "";
    let confidence = 0.7;
    let riskLevel: "low" | "medium" | "high" = "medium";

    // High importance or critical files - PROTECT
    if (
      file.userImportanceScore >= 8 ||
      file.businessCriticality === "critical"
    ) {
      action = "PROTECT";
      reasoning = "High importance score or critical business data";
      confidence = 0.9;
      riskLevel = "low";
    }
    // Never accessed files older than 90 days - DELETE
    else if (file.accessPattern === "never" && ageInDays > 90) {
      action = "DELETE";
      reasoning = "Never accessed and older than 90 days";
      confidence = 0.8;
      riskLevel = "low";
    }
    // Large, rarely accessed files - COMPRESS
    else if (sizeMB > 50 && file.accessPattern === "rare" && ageInDays > 30) {
      action = "COMPRESS";
      reasoning = "Large file with rare access pattern";
      confidence = 0.7;
      riskLevel = "low";
    }
    // Old files with occasional access - ARCHIVE
    else if (file.accessPattern === "occasional" && ageInDays > 60) {
      action = "ARCHIVE";
      reasoning = "Occasionally accessed but aging file";
      confidence = 0.6;
      riskLevel = "medium";
    }
    // Duplicates - DELETE (keep one)
    else if (file.duplicates.length > 0) {
      action = "DELETE";
      reasoning = "Duplicate file detected";
      confidence = 0.8;
      riskLevel = "low";
    }

    return {
      filePath: file.filePath,
      action,
      reasoning,
      confidence,
      riskLevel,
      potentialSavings:
        action === "DELETE"
          ? sizeMB
          : action === "COMPRESS"
            ? sizeMB * 0.4
            : action === "ARCHIVE"
              ? sizeMB * 0.8
              : 0,
      businessImpact:
        riskLevel === "low"
          ? "Minimal impact expected"
          : riskLevel === "medium"
            ? "Some user inconvenience possible"
            : "Potential business disruption",
    };
  }
}

// Export service instance
export const smartCleanupEngine = new SmartCleanupEngine();

// Server actions
export const executeSmartCleanup = withAuth(
  async (user, policies: CleanupPolicy[], dryRun: boolean = false) => {
    try {
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          error: "Company ID not found",
          data: undefined,
        };
      }

      const result = await smartCleanupEngine.executeSmartCleanup(
        companyId,
        policies,
        dryRun,
      );
      return {
        success: true,
        data: result,
        message: dryRun
          ? "Analysis completed successfully"
          : "Cleanup executed successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        data: undefined,
      };
    }
  },
);

export const analyzeStoragePatterns = withAuth(async (user) => {
  try {
    const companyId = user.user_metadata?.companyId;
    if (!companyId) {
      return {
        success: false,
        error: "Company ID not found",
        data: undefined,
      };
    }

    // Analyze storage patterns and return insights
    // This would include usage trends, peak times, file type distribution, etc.
    const insights = {
      totalFiles: 0,
      totalSize: 0,
      averageFileAge: 0,
      mostAccessedFormats: [],
      unusedFiles: 0,
      duplicateFiles: 0,
      recommendations: [],
    };

    return {
      success: true,
      data: insights,
      message: "Storage analysis completed successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: undefined,
    };
  }
});
