import { NextRequest, NextResponse } from "next/server";
import { CO2FootprintService } from "@/lib/services/co2Footprint.service";
import { co2Store } from "@/lib/stores/co2Store";

export async function POST(request: NextRequest) {
  try {
    const { assetId } = await request.json();

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: "Asset ID is required" },
        { status: 400 },
      );
    }

    const result = await CO2FootprintService.calculateAssetCO2(assetId);

    if (result.success && result.data) {
      // Return complete data directly - API routes don't have the same serialization issues as server actions
      return NextResponse.json({ success: true, data: result.data });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ API ROUTE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
