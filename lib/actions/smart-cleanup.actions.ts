"use server";

import { withAuth } from "@/lib/middleware/withAuth";
import { smartCleanupEngine } from "@/lib/services/smart-cleanup-engine-simple.service";
import { prisma } from "@/app/db";

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

interface SmartCleanupResult {
  analyzedFiles: number;
  recommendations: Array<{
    filePath: string;
    action: "DELETE" | "ARCHIVE" | "COMPRESS" | "PROTECT";
    reasoning: string;
    confidence: number;
    riskLevel: "low" | "medium" | "high";
    potentialSavings: number;
    businessImpact: string;
  }>;
  totalPotentialSavings: number;
  summary: {
    deleteCount: number;
    archiveCount: number;
    compressCount: number;
    protectCount: number;
  };
}

export const analyzeReports = withAuth(async (user) => {
  try {
    console.log("🔍 Starting smart cleanup analysis...");
    
    const companyId = user.user_metadata.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    // Use the smart cleanup engine to analyze reports
    const analysisResult = await smartCleanupEngine.analyzeReports(companyId);
    
    console.log(`✅ Analysis complete: ${analysisResult.analyzedFiles} files analyzed`);
    
    return {
      success: true,
      data: analysisResult,
    };
  } catch (error) {
    console.error("Error analyzing reports:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed"
    };
  }
});

export const getCleanupPolicies = withAuth(async (user) => {
  try {
    const companyId = user.user_metadata.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    // Get existing cleanup policies for the company
    const policies = await prisma.cleanupPolicy.findMany({
      where: { companyId },
      orderBy: { format: 'asc' }
    });

    // If no policies exist, return default ones
    if (policies.length === 0) {
      const defaultPolicies = [
        {
          name: "PDF Reports",
          format: "PDF",
          retentionDays: 90,
          maxFiles: 50,
          maxSizeGB: 0.5,
          priority: "medium" as const,
        },
        {
          name: "Excel Reports", 
          format: "XLSX",
          retentionDays: 60,
          maxFiles: 30,
          maxSizeGB: 0.2,
          priority: "high" as const,
        },
        {
          name: "CSV Exports",
          format: "CSV", 
          retentionDays: 30,
          maxFiles: 20,
          maxSizeGB: 0.1,
          priority: "low" as const,
        }
      ];

      return {
        success: true,
        data: defaultPolicies
      };
    }

    return {
      success: true,
      data: policies.map(policy => ({
        name: policy.name,
        format: policy.format,
        retentionDays: policy.retentionDays,
        maxFiles: policy.maxFiles || 0,
        maxSizeGB: policy.maxSizeGB || 0,
        priority: policy.priority as "low" | "medium" | "high",
      }))
    };
  } catch (error) {
    console.error("Error fetching cleanup policies:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch policies"
    };
  }
});

export const executeSingleRecommendation = withAuth(async (user, recommendation: any) => {
  try {
    const companyId = user.user_metadata.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    console.log(`🎯 Executing single recommendation: ${recommendation.action} for ${recommendation.filePath}`);
    
    let result: any = {
      filePath: recommendation.filePath,
      action: recommendation.action,
      executed: false,
      spaceSaved: 0,
      timestamp: new Date().toISOString()
    };

    switch (recommendation.action) {
      case 'PROTECT':
        // Create a FileProtectionRule to permanently protect this file
        const protectionRule = await prisma.fileProtectionRule.create({
          data: {
            companyId,
            filePath: recommendation.filePath,
            protectionType: 'PERMANENT',
            reason: `User protected: ${recommendation.reasoning}`,
            createdBy: user.id,
          }
        });

        // Log the protection action
        await prisma.reportCleanupLog.create({
          data: {
            companyId,
            filePath: recommendation.filePath,
            action: 'PROTECT',
            spaceSaved: 0,
            reasoning: `File protected by user. ${recommendation.reasoning}`,
            confidence: recommendation.confidence,
            executedBy: user.id,
          }
        });

        result = {
          ...result,
          executed: true,
          protectionRuleId: protectionRule.id,
          message: 'File has been permanently protected from cleanup'
        };
        break;

      case 'DELETE':
        // TODO: Implement actual file deletion from S3 and database
        // For now, just log the action
        await prisma.reportCleanupLog.create({
          data: {
            companyId,
            filePath: recommendation.filePath,
            action: 'DELETE',
            spaceSaved: recommendation.potentialSavings || 0,
            reasoning: recommendation.reasoning,
            confidence: recommendation.confidence,
            executedBy: user.id,
          }
        });

        result = {
          ...result,
          executed: true,
          spaceSaved: recommendation.potentialSavings || 0,
          message: 'File marked for deletion (implementation pending)'
        };
        break;

      case 'ARCHIVE':
        // TODO: Implement actual archiving (move to cold storage)
        await prisma.reportCleanupLog.create({
          data: {
            companyId,
            filePath: recommendation.filePath,
            action: 'ARCHIVE',
            spaceSaved: Math.floor((recommendation.potentialSavings || 0) * 0.3), // Assume 30% savings from archiving
            reasoning: recommendation.reasoning,
            confidence: recommendation.confidence,
            executedBy: user.id,
          }
        });

        result = {
          ...result,
          executed: true,
          spaceSaved: Math.floor((recommendation.potentialSavings || 0) * 0.3),
          message: 'File marked for archiving (implementation pending)'
        };
        break;

      case 'COMPRESS':
        // TODO: Implement actual compression
        await prisma.reportCleanupLog.create({
          data: {
            companyId,
            filePath: recommendation.filePath,
            action: 'COMPRESS',
            spaceSaved: Math.floor((recommendation.potentialSavings || 0) * 0.5), // Assume 50% savings from compression
            reasoning: recommendation.reasoning,
            confidence: recommendation.confidence,
            executedBy: user.id,
          }
        });

        result = {
          ...result,
          executed: true,
          spaceSaved: Math.floor((recommendation.potentialSavings || 0) * 0.5),
          message: 'File marked for compression (implementation pending)'
        };
        break;

      default:
        throw new Error(`Unknown action: ${recommendation.action}`);
    }

    return {
      success: true,
      data: result,
      message: result.message || `${recommendation.action} executed successfully`
    };
  } catch (error) {
    console.error("Error executing single recommendation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});

export const executeAllRecommendations = withAuth(async (user, recommendations: any[]) => {
  try {
    const companyId = user.user_metadata.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    console.log(`🚀 Executing ${recommendations.length} recommendations...`);
    
    let executedCount = 0;
    let totalSavings = 0;
    let protectedCount = 0;
    const results = [];

    for (const rec of recommendations) {
      try {
        const singleResult = await executeSingleRecommendation(user, rec);
        
        if (singleResult.success && singleResult.data.executed) {
          executedCount++;
          totalSavings += singleResult.data.spaceSaved || 0;
          
          if (rec.action === 'PROTECT') {
            protectedCount++;
          }
        }
        
        results.push({
          filePath: rec.filePath,
          action: rec.action,
          executed: singleResult.success && singleResult.data.executed,
          spaceSaved: singleResult.data?.spaceSaved || 0,
          error: singleResult.success ? null : singleResult.error
        });
      } catch (error) {
        results.push({
          filePath: rec.filePath,
          action: rec.action,
          executed: false,
          spaceSaved: 0,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    const mockResult = {
      executedCount,
      totalSavings,
      protectedCount,
      results,
      timestamp: new Date().toISOString()
    };

    return {
      success: true,
      data: mockResult,
      message: `Executed ${executedCount} recommendations successfully${protectedCount > 0 ? `, protected ${protectedCount} files` : ''}`
    };
  } catch (error) {
    console.error("Error executing all recommendations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
});

// Get protection rules for a company
export const getProtectionRules = withAuth(async (user) => {
  try {
    const companyId = user.user_metadata.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    const rules = await prisma.fileProtectionRule.findMany({
      where: { 
        companyId,
        // Only get active rules (not expired)
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: rules
    };
  } catch (error) {
    console.error("Error fetching protection rules:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch protection rules"
    };
  }
});

// Remove protection from a file
export const removeProtection = withAuth(async (user, protectionRuleId: string) => {
  try {
    const companyId = user.user_metadata.companyId;
    if (!companyId) {
      throw new Error("Company ID not found");
    }

    // Verify the rule belongs to the user's company
    const rule = await prisma.fileProtectionRule.findFirst({
      where: {
        id: protectionRuleId,
        companyId
      }
    });

    if (!rule) {
      throw new Error("Protection rule not found or access denied");
    }

    // Delete the protection rule
    await prisma.fileProtectionRule.delete({
      where: { id: protectionRuleId }
    });

    // Log the removal
    await prisma.reportCleanupLog.create({
      data: {
        companyId,
        filePath: rule.filePath || 'unknown',
        action: 'UNPROTECT',
        spaceSaved: 0,
        reasoning: 'Protection removed by user',
        executedBy: user.id,
      }
    });

    return {
      success: true,
      message: 'File protection removed successfully'
    };
  } catch (error) {
    console.error("Error removing protection:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove protection"
    };
  }
}); 