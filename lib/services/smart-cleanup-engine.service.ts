"use server";

import { S3Client, ListObjectsV2Command, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";

interface CleanupPolicy {
  format: string;
  retentionDays: number;
  maxFiles: number;
  maxSizeGB: number;
  protectionRules: ProtectionRule[];
  priority: 'low' | 'medium' | 'high';
}

interface ProtectionRule {
  type: 'usage_frequency' | 'file_age' | 'file_size' | 'user_importance' | 'business_critical';
  threshold: number;
  action: 'protect' | 'archive' | 'delete';
  description: string;
}

interface FileAnalysis {
  key: string;
  size: number;
  lastModified: Date;
  downloadCount: number;
  lastAccessed: Date;
  userImportance: number; // 1-10 scale
  businessCritical: boolean;
  duplicateOf?: string;
  compressionRatio?: number;
  predictedNextAccess?: Date;
}

interface CleanupRecommendation {
  action: 'delete' | 'archive' | 'compress' | 'protect';
  confidence: number; // 0-1 scale
  reasoning: string[];
  estimatedSavings: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface SmartCleanupResult {
  totalFilesAnalyzed: number;
  filesDeleted: number;
  filesArchived: number;
  filesCompressed: number;
  spaceSaved: number;
  recommendations: Array<{
    file: string;
    recommendation: CleanupRecommendation;
  }>;
  protectedFiles: string[];
  warnings: string[];
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
  private async analyzeFile(key: string, companyId: string): Promise<FileAnalysis> {
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
        orderBy: { downloadedAt: 'desc' },
      });

      // Calculate usage metrics
      const downloadCount = downloadStats.length;
      const lastAccessed = downloadStats[0]?.downloadedAt || metadata.LastModified || new Date(0);
      const daysSinceLastAccess = Math.floor((Date.now() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24));

      // Analyze access patterns to predict next access
      const accessIntervals = this.calculateAccessIntervals(downloadStats);
      const predictedNextAccess = this.predictNextAccess(accessIntervals, lastAccessed);

      // Check for duplicates
      const duplicateOf = await this.findDuplicateFile(key, metadata.ContentLength || 0);

      // Calculate user importance based on download frequency and recency
      const userImportance = this.calculateUserImportance(downloadCount, daysSinceLastAccess);

      // Determine business criticality
      const businessCritical = this.isBusinessCritical(key, downloadCount, daysSinceLastAccess);

      return {
        key,
        size: metadata.ContentLength || 0,
        lastModified: metadata.LastModified || new Date(),
        downloadCount,
        lastAccessed,
        userImportance,
        businessCritical,
        duplicateOf,
        predictedNextAccess,
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
      const interval = downloadStats[i-1].downloadedAt.getTime() - downloadStats[i].downloadedAt.getTime();
      intervals.push(interval / (1000 * 60 * 60 * 24)); // Convert to days
    }
    return intervals;
  }

  /**
   * Predicts when a file might be accessed next based on historical patterns
   */
  private predictNextAccess(intervals: number[], lastAccessed: Date): Date | undefined {
    if (intervals.length === 0) return undefined;

    // Calculate average interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // Add some variance based on pattern consistency
    const variance = this.calculateVariance(intervals);
    const adjustedInterval = avgInterval + (variance * 0.5);

    return new Date(lastAccessed.getTime() + (adjustedInterval * 24 * 60 * 60 * 1000));
  }

  /**
   * Calculates variance in access intervals
   */
  private calculateVariance(intervals: number[]): number {
    if (intervals.length === 0) return 0;
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculates user importance score (1-10)
   */
  private calculateUserImportance(downloadCount: number, daysSinceLastAccess: number): number {
    // High download count = high importance
    const downloadScore = Math.min(downloadCount / 10, 5); // Max 5 points for downloads
    
    // Recent access = high importance
    const recencyScore = Math.max(5 - (daysSinceLastAccess / 30), 0); // Max 5 points for recency
    
    return Math.min(downloadScore + recencyScore, 10);
  }

  /**
   * Determines if a file is business critical
   */
  private isBusinessCritical(key: string, downloadCount: number, daysSinceLastAccess: number): boolean {
    // Files accessed frequently or recently are likely business critical
    const isFrequentlyAccessed = downloadCount >= 5;
    const isRecentlyAccessed = daysSinceLastAccess <= 7;
    const isReportFile = key.includes('report') || key.includes('dashboard');
    
    return isFrequentlyAccessed || (isRecentlyAccessed && isReportFile);
  }

  /**
   * Finds duplicate files based on size and naming patterns
   */
  private async findDuplicateFile(key: string, size: number): Promise<string | undefined> {
    try {
      // Simple duplicate detection based on size and similar naming
      const baseName = key.split('/').pop()?.replace(/\d{4}-\d{2}-\d{2}/, 'DATE');
      
      const listCommand = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: key.split('/').slice(0, -1).join('/'),
      });
      
      const response = await this.s3Client.send(listCommand);
      const similarFiles = response.Contents?.filter(obj => 
        obj.Key !== key &&
        obj.Size === size &&
        obj.Key?.includes(baseName?.split('.')[0] || '')
      );

      return similarFiles?.[0]?.Key;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Generates intelligent cleanup recommendation for a file
   */
  private generateRecommendation(analysis: FileAnalysis, policy: CleanupPolicy): CleanupRecommendation {
    const reasons: string[] = [];
    let action: CleanupRecommendation['action'] = 'delete';
    let confidence = 0.5;
    let riskLevel: CleanupRecommendation['riskLevel'] = 'medium';

    // Protection rules evaluation
    if (analysis.businessCritical) {
      action = 'protect';
      confidence = 0.9;
      riskLevel = 'low';
      reasons.push('File is marked as business critical');
      return { action, confidence, reasoning: reasons, estimatedSavings: 0, riskLevel };
    }

    if (analysis.userImportance >= 8) {
      action = 'protect';
      confidence = 0.8;
      riskLevel = 'low';
      reasons.push(`High user importance score: ${analysis.userImportance}/10`);
      return { action, confidence, reasoning: reasons, estimatedSavings: 0, riskLevel };
    }

    // Age-based analysis
    const daysSinceModified = Math.floor((Date.now() - analysis.lastModified.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceAccessed = Math.floor((Date.now() - analysis.lastAccessed.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceAccessed > policy.retentionDays) {
      if (analysis.downloadCount === 0) {
        action = 'delete';
        confidence = 0.9;
        riskLevel = 'low';
        reasons.push(`Never accessed and older than ${policy.retentionDays} days`);
      } else if (analysis.downloadCount < 3 && daysSinceAccessed > policy.retentionDays * 2) {
        action = 'delete';
        confidence = 0.8;
        riskLevel = 'low';
        reasons.push(`Rarely accessed (${analysis.downloadCount} times) and very old`);
      } else {
        action = 'archive';
        confidence = 0.7;
        riskLevel = 'medium';
        reasons.push(`Old but has some usage history - safe to archive`);
      }
    } else if (analysis.duplicateOf) {
      action = 'delete';
      confidence = 0.85;
      riskLevel = 'low';
      reasons.push(`Duplicate of ${analysis.duplicateOf}`);
    } else if (analysis.size > 100 * 1024 * 1024 && analysis.downloadCount < 2) { // > 100MB, rarely accessed
      action = 'compress';
      confidence = 0.7;
      riskLevel = 'low';
      reasons.push('Large file with low usage - good candidate for compression');
    } else if (analysis.predictedNextAccess && analysis.predictedNextAccess > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)) {
      action = 'archive';
      confidence = 0.6;
      riskLevel = 'medium';
      reasons.push('Predicted next access is more than 90 days away');
    } else {
      action = 'protect';
      confidence = 0.6;
      riskLevel = 'high';
      reasons.push('File appears to be actively used or important');
    }

    const estimatedSavings = action === 'delete' ? analysis.size : 
                           action === 'compress' ? analysis.size * 0.7 : 
                           action === 'archive' ? analysis.size * 0.9 : 0;

    return { action, confidence, reasoning: reasons, estimatedSavings, riskLevel };
  }

  /**
   * Executes cleanup actions based on recommendations
   */
  private async executeCleanup(
    analysis: FileAnalysis, 
    recommendation: CleanupRecommendation,
    companyId: string,
    dryRun: boolean = false
  ): Promise<{ executed: boolean; error?: string }> {
    if (dryRun) {
      return { executed: false };
    }

    try {
      switch (recommendation.action) {
        case 'delete':
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: analysis.key,
          }));
          
          // Log the deletion
          await prisma.reportCleanupLog.create({
            data: {
              companyId,
              filePath: analysis.key,
              action: 'DELETE',
              spaceSaved: analysis.size,
              reasoning: recommendation.reasoning.join('; '),
              confidence: recommendation.confidence,
            },
          });
          break;

        case 'archive':
          // Move to archive storage class
          // Implementation would depend on your archiving strategy
          await this.archiveFile(analysis.key);
          break;

        case 'compress':
          // Implement compression logic
          await this.compressFile(analysis.key);
          break;

        case 'protect':
          // Add protection metadata
          await this.protectFile(analysis.key);
          break;
      }

      return { executed: true };
    } catch (error) {
      return { executed: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
    dryRun: boolean = false
  ): Promise<SmartCleanupResult> {
    const result: SmartCleanupResult = {
      totalFilesAnalyzed: 0,
      filesDeleted: 0,
      filesArchived: 0,
      filesCompressed: 0,
      spaceSaved: 0,
      recommendations: [],
      protectedFiles: [],
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
          const fileFormat = file.Key.split('.').pop()?.toLowerCase() || '';
          const policy = policies.find(p => p.format === fileFormat) || policies[0];

          // Generate recommendation
          const recommendation = this.generateRecommendation(analysis, policy);
          
          result.recommendations.push({
            file: file.Key,
            recommendation,
          });

          // Execute action if not dry run
          const execution = await this.executeCleanup(analysis, recommendation, companyId, dryRun);

          if (execution.executed) {
            switch (recommendation.action) {
              case 'delete':
                result.filesDeleted++;
                break;
              case 'archive':
                result.filesArchived++;
                break;
              case 'compress':
                result.filesCompressed++;
                break;
              case 'protect':
                result.protectedFiles.push(file.Key);
                break;
            }
            result.spaceSaved += recommendation.estimatedSavings;
          } else if (execution.error) {
            result.warnings.push(`Failed to process ${file.Key}: ${execution.error}`);
          }

        } catch (error) {
          result.warnings.push(`Error analyzing ${file.Key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

    } catch (error) {
      result.warnings.push(`Error during cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }
}

// Export service instance
export const smartCleanupEngine = new SmartCleanupEngine();

// Server actions
export const executeSmartCleanup = withAuth(
  async (user, policies: CleanupPolicy[], dryRun: boolean = false) => {
    const companyId = user.user_metadata?.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    return await smartCleanupEngine.executeSmartCleanup(companyId, policies, dryRun);
  }
);

export const analyzeStoragePatterns = withAuth(
  async (user) => {
    const companyId = user.user_metadata?.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
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

    return insights;
  }
); 