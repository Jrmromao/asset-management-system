import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateAssetInsights } from "@/lib/services/ai-analytics.service";

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { analysisType = 'comprehensive' } = body;

    // For now, we'll use a mock company ID
    // In production, this would come from the user's organization
    const companyId = orgId || "mock-company-id";

    const insights = await generateAssetInsights(companyId, analysisType);
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 