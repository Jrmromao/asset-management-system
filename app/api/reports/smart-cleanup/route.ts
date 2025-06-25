import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { executeSmartCleanup, analyzeStoragePatterns } from "@/lib/services/smart-cleanup-engine.service";

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
        const analysisResponse = await analyzeStoragePatterns();
        return NextResponse.json({
          success: analysisResponse.success,
          data: analysisResponse.data,
          message: analysisResponse.message,
        });

      case "recommendations":
        // Get smart cleanup recommendations without executing
        const dryRunPolicies = [
          {
            format: "pdf",
            retentionDays: 90,
            maxFiles: 1000,
            maxSizeGB: 10,
            protectionRules: [],
            priority: "medium" as const,
          },
          {
            format: "xlsx",
            retentionDays: 60,
            maxFiles: 500,
            maxSizeGB: 5,
            protectionRules: [],
            priority: "medium" as const,
          },
          {
            format: "csv",
            retentionDays: 30,
            maxFiles: 200,
            maxSizeGB: 2,
            protectionRules: [],
            priority: "low" as const,
          },
        ];

        const cleanupResponse = await executeSmartCleanup(dryRunPolicies, true);
        return NextResponse.json({
          success: cleanupResponse.success,
          data: cleanupResponse.data,
          message: cleanupResponse.message,
        });

      default:
        return NextResponse.json(
          { error: "Invalid action parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Smart cleanup analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze storage" },
      { status: 500 }
    );
  }
}

// POST: Execute smart cleanup with custom policies
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { policies, dryRun = false } = body;

    if (!policies || !Array.isArray(policies)) {
      return NextResponse.json(
        { error: "Invalid policies provided" },
        { status: 400 }
      );
    }

    // Validate policy structure
    for (const policy of policies) {
      if (!policy.format || !policy.retentionDays) {
        return NextResponse.json(
          { error: "Each policy must have format and retentionDays" },
          { status: 400 }
        );
      }
    }

    const result = await executeSmartCleanup(policies, dryRun);

    return NextResponse.json({
      success: true,
      data: result,
      message: dryRun 
        ? "Smart cleanup analysis completed (dry run)" 
        : "Smart cleanup executed successfully",
    });
  } catch (error) {
    console.error("Smart cleanup execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute smart cleanup" },
      { status: 500 }
    );
  }
} 