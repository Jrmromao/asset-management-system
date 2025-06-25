import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import { withAuth } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface BulkOperationResult {
  success: boolean;
  data?: any;
  error?: string;
  processed: number;
  failed: number;
  details: Array<{
    id: string;
    status: "success" | "failed";
    error?: string;
  }>;
}

interface SmartAssignmentRecommendation {
  userId: string;
  userName: string;
  assetIds: string[];
  reasoning: string;
  confidenceScore: number;
  department: string;
  role: string;
  matchFactors: string[];
}

/**
 * AI-Powered Smart Asset Assignment
 * Analyzes user profiles, asset requirements, and organizational patterns
 * to recommend optimal asset assignments
 */
export const generateSmartAssignmentRecommendations = withAuth(
  async (
    user,
    assetIds: string[],
  ): Promise<{
    success: boolean;
    data?: SmartAssignmentRecommendation[];
    error?: string;
  }> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return { success: false, error: "User not associated with a company" };
      }

      // Fetch assets with detailed information
      const assets = (await prisma.asset.findMany({
        where: {
          id: { in: assetIds },
          companyId,
        },
        include: {
          model: true,
          statusLabel: true,
          department: true,
          category: true,
        },
      })) as any[];

      // Fetch available users with their profiles and assigned assets
      const users = (await prisma.user.findMany({
        where: {
          companyId,
          active: true,
        },
        include: {
          department: true,
          role: true,
          assets: true,
        },
      })) as any[];

      // Prepare data for AI analysis
      const analysisData = {
        assets: assets.map((asset: any) => ({
          id: asset.id,
          name: asset.name,
          category: asset.category?.name || "Unknown",
          manufacturer: asset.model?.name || "Unknown",
          modelName: asset.model?.name || "Unknown",
          department: asset.department?.name || "Unassigned",
          specifications: {},
        })),
        users: users.map((user: any) => ({
          id: user.id,
          name: user.name || "Unknown User",
          email: user.email,
          department: user.department?.name || "Unassigned",
          role: user.role?.name || "Unknown Role",
          title: user.title || "Unknown Title",
          currentAssets: (user.assets || []).map((asset: any) => ({
            category: "Unknown",
            name: asset.name || "Unknown",
          })),
          assetCount: (user.assets || []).length,
        })),
        organizationalContext: {
          totalUsers: users.length,
          departments: Array.from(
            new Set(users.map((u: any) => u.department?.name).filter(Boolean)),
          ),
          roles: Array.from(
            new Set(users.map((u: any) => u.role?.name).filter(Boolean)),
          ),
        },
      };

      const prompt = `
      You are an expert IT Asset Manager with deep knowledge of organizational efficiency and technology allocation.
      Analyze the following data to recommend optimal asset assignments that maximize productivity and efficiency.

      **Assets to Assign:**
      ${JSON.stringify(analysisData.assets, null, 2)}

      **Available Users:**
      ${JSON.stringify(analysisData.users, null, 2)}

      **Organizational Context:**
      ${JSON.stringify(analysisData.organizationalContext, null, 2)}

      **Assignment Criteria:**
      1. **Role Compatibility**: Match asset capabilities with user responsibilities
      2. **Department Alignment**: Prioritize users in relevant departments
      3. **Current Workload**: Consider existing asset assignments
      4. **Skill Level**: Match asset complexity with user technical proficiency
      5. **Workflow Efficiency**: Optimize for team collaboration and productivity
      6. **Cost Efficiency**: Balance high-value assets with appropriate users
      7. **Growth Potential**: Consider user development and future needs

      **Output JSON Format:**
      {
        "recommendations": [
          {
            "userId": "user-id",
            "userName": "User Name",
            "assetIds": ["asset-id-1", "asset-id-2"],
            "reasoning": "Detailed explanation of why this assignment is optimal",
            "confidenceScore": 0.0-1.0,
            "department": "User's department",
            "role": "User's role",
            "matchFactors": [
              "Specific factors that make this a good match",
              "e.g., 'Role requires high-performance computing'",
              "e.g., 'Department budget allows for premium equipment'"
            ]
          }
        ],
        "alternativeOptions": [
          {
            "userId": "alternative-user-id",
            "assetIds": ["asset-id"],
            "reasoning": "Why this could be a secondary option",
            "confidenceScore": 0.0-1.0
          }
        ],
        "unassignedAssets": [
          {
            "assetId": "asset-id",
            "reason": "Why this asset couldn't be optimally assigned",
            "suggestions": ["Recommendations for handling this asset"]
          }
        ]
      }

      Provide specific, actionable recommendations that optimize both individual productivity and organizational efficiency.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");

      return {
        success: true,
        data: analysis.recommendations || [],
      };
    } catch (error) {
      console.error(
        "Error generating smart assignment recommendations:",
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
);

/**
 * Bulk assign assets to users
 */
export const bulkAssignAssets = withAuth(
  async (
    user,
    assignments: Array<{ assetId: string; userId: string }>,
  ): Promise<BulkOperationResult> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User not associated with a company",
          processed: 0,
          failed: 0,
          details: [],
        };
      }

      const results: Array<{
        id: string;
        status: "success" | "failed";
        error?: string;
      }> = [];
      let processed = 0;
      let failed = 0;

      // Process assignments in transaction
      await prisma.$transaction(async (tx) => {
        for (const assignment of assignments) {
          try {
            // Verify asset exists and belongs to company
            const asset = await tx.asset.findFirst({
              where: {
                id: assignment.assetId,
                companyId,
              },
            });

            if (!asset) {
              results.push({
                id: assignment.assetId,
                status: "failed",
                error: "Asset not found or access denied",
              });
              failed++;
              continue;
            }

            // Verify user exists and belongs to company
            const targetUser = await tx.user.findFirst({
              where: {
                id: assignment.userId,
                companyId,
              },
            });

            if (!targetUser) {
              results.push({
                id: assignment.assetId,
                status: "failed",
                error: "User not found or access denied",
              });
              failed++;
              continue;
            }

            // Update asset assignment
            await tx.asset.update({
              where: { id: assignment.assetId },
              data: { userId: assignment.userId },
            });

            // Create audit log
            const internalUser = await tx.user.findFirst({
              where: { oauthId: user.id, companyId },
              select: { id: true },
            });

            if (internalUser) {
              await tx.auditLog.create({
                data: {
                  action: "BULK_ASSET_ASSIGNMENT",
                  entity: "ASSET",
                  entityId: assignment.assetId,
                  userId: internalUser.id,
                  companyId,
                  details: `Asset ${assignment.assetId} assigned to user ${assignment.userId} via bulk operation`,
                },
              });

              // Create asset history
              await tx.assetHistory.create({
                data: {
                  assetId: assignment.assetId,
                  type: "assignment",
                  companyId,
                  notes: `Bulk assignment to user ${assignment.userId}`,
                },
              });
            }

            results.push({
              id: assignment.assetId,
              status: "success",
            });
            processed++;
          } catch (error) {
            results.push({
              id: assignment.assetId,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            });
            failed++;
          }
        }
      });

      revalidatePath("/assets");

      return {
        success: true,
        processed,
        failed,
        details: results,
      };
    } catch (error) {
      console.error("Error in bulk asset assignment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processed: 0,
        failed: assignments.length,
        details: assignments.map((a) => ({
          id: a.assetId,
          status: "failed" as const,
          error: "Transaction failed",
        })),
      };
    }
  },
);

/**
 * Bulk update asset status
 */
export const bulkUpdateAssetStatus = withAuth(
  async (
    user,
    assetIds: string[],
    statusLabelId: string,
  ): Promise<BulkOperationResult> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User not associated with a company",
          processed: 0,
          failed: 0,
          details: [],
        };
      }

      const results: Array<{
        id: string;
        status: "success" | "failed";
        error?: string;
      }> = [];
      let processed = 0;
      let failed = 0;

      await prisma.$transaction(async (tx) => {
        for (const assetId of assetIds) {
          try {
            const asset = await tx.asset.findFirst({
              where: { id: assetId, companyId },
            });

            if (!asset) {
              results.push({
                id: assetId,
                status: "failed",
                error: "Asset not found",
              });
              failed++;
              continue;
            }

            await tx.asset.update({
              where: { id: assetId },
              data: { statusLabelId },
            });

            // Create audit log
            const internalUser = await tx.user.findFirst({
              where: { oauthId: user.id, companyId },
              select: { id: true },
            });

            if (internalUser) {
              await tx.auditLog.create({
                data: {
                  action: "BULK_STATUS_UPDATE",
                  entity: "ASSET",
                  entityId: assetId,
                  userId: internalUser.id,
                  companyId,
                  details: `Asset status updated to ${statusLabelId} via bulk operation`,
                },
              });
            }

            results.push({ id: assetId, status: "success" });
            processed++;
          } catch (error) {
            results.push({
              id: assetId,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            });
            failed++;
          }
        }
      });

      revalidatePath("/assets");

      return {
        success: true,
        processed,
        failed,
        details: results,
      };
    } catch (error) {
      console.error("Error in bulk status update:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processed: 0,
        failed: assetIds.length,
        details: assetIds.map((id) => ({
          id,
          status: "failed" as const,
          error: "Transaction failed",
        })),
      };
    }
  },
);

/**
 * Bulk check-in assets
 */
export const bulkCheckinAssets = withAuth(
  async (user, assetIds: string[]): Promise<BulkOperationResult> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User not associated with a company",
          processed: 0,
          failed: 0,
          details: [],
        };
      }

      const results: Array<{
        id: string;
        status: "success" | "failed";
        error?: string;
      }> = [];
      let processed = 0;
      let failed = 0;

      await prisma.$transaction(async (tx) => {
        for (const assetId of assetIds) {
          try {
            const asset = await tx.asset.findFirst({
              where: { id: assetId, companyId },
              select: { id: true, userId: true },
            });

            if (!asset) {
              results.push({
                id: assetId,
                status: "failed",
                error: "Asset not found",
              });
              failed++;
              continue;
            }

            await tx.asset.update({
              where: { id: assetId },
              data: { userId: null },
            });

            // Create audit log
            const internalUser = await tx.user.findFirst({
              where: { oauthId: user.id, companyId },
              select: { id: true },
            });

            if (internalUser) {
              await tx.auditLog.create({
                data: {
                  action: "BULK_ASSET_CHECKIN",
                  entity: "ASSET",
                  entityId: assetId,
                  userId: internalUser.id,
                  companyId,
                  details: `Asset checked in via bulk operation${asset.userId ? ` from user ${asset.userId}` : ""}`,
                },
              });

              await tx.assetHistory.create({
                data: {
                  assetId,
                  type: "return",
                  companyId,
                  notes: `Bulk check-in operation${asset.userId ? ` from user ${asset.userId}` : ""}`,
                },
              });
            }

            results.push({ id: assetId, status: "success" });
            processed++;
          } catch (error) {
            results.push({
              id: assetId,
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
            });
            failed++;
          }
        }
      });

      revalidatePath("/assets");

      return {
        success: true,
        processed,
        failed,
        details: results,
      };
    } catch (error) {
      console.error("Error in bulk check-in:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processed: 0,
        failed: assetIds.length,
        details: assetIds.map((id) => ({
          id,
          status: "failed" as const,
          error: "Transaction failed",
        })),
      };
    }
  },
);

export type { BulkOperationResult, SmartAssignmentRecommendation };
