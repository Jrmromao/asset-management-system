import { NextRequest, NextResponse } from "next/server";
import { CO2ConsistencyService } from "@/lib/services/co2-consistency.service";

export async function POST(request: NextRequest) {
  try {
    const { name, manufacturer, model, category, forceRecalculate } =
      await request.json();

    if (!name || !manufacturer || !model) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset name, manufacturer, and model are required",
        },
        { status: 400 },
      );
    }

    const result = await CO2ConsistencyService.calculateConsistentCO2(
      name,
      manufacturer,
      model,
      category,
      forceRecalculate || false,
    );

    return NextResponse.json({
      success: result.success,
      data: result.data,
      error: result.error,
      source: result.source,
      fingerprint: result.fingerprint,
    });
  } catch (error: any) {
    console.error("❌ API ROUTE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
