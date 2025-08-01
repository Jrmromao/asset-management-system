import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  analyzeReports,
  getCleanupPolicies,
  executeSingleRecommendation,
  executeAllRecommendations,
} from "@/lib/actions/smart-cleanup.actions";

// GET: Analyze storage patterns and get insights
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "analyze";

    switch (action) {
      case "analyze":
        const analysisResponse = await analyzeReports();
        return NextResponse.json({
          success: analysisResponse.success,
          data: analysisResponse.data,
          message: analysisResponse.message || "Storage analysis completed",
        });

      case "recommendations":
        // Get smart cleanup recommendations - this is the same as analyze
        const recommendationsResponse = await analyzeReports();
        return NextResponse.json({
          success: recommendationsResponse.success,
          data: recommendationsResponse.data,
          message:
            recommendationsResponse.message ||
            "Smart cleanup recommendations generated",
        });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Smart cleanup analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze storage" },
      { status: 500 },
    );
  }
}

// POST: Execute smart cleanup operations
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      action,
      policies,
      dryRun = false,
      recommendation,
      recommendations,
    } = body;

    switch (action) {
      case "execute_single":
        // Execute a single recommendation
        if (!recommendation) {
          return NextResponse.json(
            { error: "Recommendation is required" },
            { status: 400 },
          );
        }

        const singleResult = await executeSingleRecommendation(recommendation);
        return NextResponse.json({
          success: singleResult.success,
          data: singleResult.data,
          message: `${recommendation.action} executed successfully`,
        });

      case "execute_all":
        // Execute all recommendations
        if (!recommendations || !Array.isArray(recommendations)) {
          return NextResponse.json(
            { error: "Recommendations array is required" },
            { status: 400 },
          );
        }

        const allResult = await executeAllRecommendations(recommendations);
        return NextResponse.json({
          success: allResult.success,
          data: allResult.data,
          message: `Executed ${allResult.data?.executedCount || 0} recommendations`,
        });

      default:
        // Default: Execute smart cleanup with policies
        if (!policies || !Array.isArray(policies)) {
          return NextResponse.json(
            { error: "Invalid policies provided" },
            { status: 400 },
          );
        }

        // Validate policy structure
        for (const policy of policies) {
          if (!policy.format || !policy.retentionDays) {
            return NextResponse.json(
              { error: "Each policy must have format and retentionDays" },
              { status: 400 },
            );
          }
        }

        // For now, just return the analysis since we don't have bulk policy execution
        const result = await analyzeReports();
        return NextResponse.json({
          success: result.success,
          data: result.data,
          message: dryRun
            ? "Smart cleanup analysis completed (dry run)"
            : "Smart cleanup analysis completed",
        });
    }
  } catch (error) {
    console.error("Smart cleanup execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute smart cleanup" },
      { status: 500 },
    );
  }
}
