import { NextRequest, NextResponse } from "next/server";
import { generateAssetInsights } from "@/lib/services/ai-analytics.service";

export async function GET(request: NextRequest) {
  try {
    console.log("🧪 Debug AI Analysis: Starting test");

    // Test with a mock user ID
    const testUserId = "cmc80pcfb00088oa52sxacapd";

    const analysisOptions = {
      analysisType: "comprehensive" as const,
      includeUtilization: true,
      includeLifecycle: true,
      includeAnomalies: true,
    };

    console.log("🔍 Debug AI Analysis: Calling generateAssetInsights");
    const result = await generateAssetInsights(testUserId, analysisOptions);

    console.log("📊 Debug AI Analysis: Result", {
      success: result.success,
      hasData: !!result.data,
      error: result.error,
      insightsCount: result.data?.insights?.length || 0,
    });

    return NextResponse.json({
      success: true,
      debug: true,
      result: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("💥 Debug AI Analysis: Error", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        debug: true,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
