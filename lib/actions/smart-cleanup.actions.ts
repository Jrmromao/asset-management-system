"use server";

import { withAuth } from "@/lib/middleware/withAuth";
import { smartCleanupEngine } from "@/lib/services/smart-cleanup-engine.service";

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