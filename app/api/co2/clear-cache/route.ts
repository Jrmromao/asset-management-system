import { NextRequest, NextResponse } from "next/server";
import { CO2ConsistencyService } from "@/lib/services/co2-consistency.service";

export async function POST(request: NextRequest) {
  try {
    const { fingerprint } = await request.json();

    const result = await CO2ConsistencyService.clearCO2Cache(fingerprint);

    return NextResponse.json({
      success: result.success,
      deletedCount: result.deletedCount,
      message: fingerprint
        ? `Cleared cache for fingerprint: ${fingerprint}`
        : `Cleared all cached calculations (${result.deletedCount} records)`,
    });
  } catch (error: any) {
    console.error("❌ API ROUTE Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
