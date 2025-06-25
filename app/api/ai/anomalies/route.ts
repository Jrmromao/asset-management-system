import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { detectAssetAnomalies } from "@/lib/services/ai-analytics.service";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const anomalies = await detectAssetAnomalies(userId);

    return NextResponse.json(anomalies);
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
