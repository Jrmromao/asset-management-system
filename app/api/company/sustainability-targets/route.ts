import { NextRequest, NextResponse } from "next/server";
import {
  getSustainabilityTargets,
  updateSustainabilityTargets,
} from "@/lib/actions/sustainabilityTargets.actions";

export async function GET(request: NextRequest) {
  try {
    const result = await getSustainabilityTargets();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetEnergy, targetCarbonReduction } = body;

    // Validate input
    if (
      targetEnergy !== null &&
      (typeof targetEnergy !== "number" || targetEnergy < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid energy target value" },
        { status: 400 },
      );
    }

    if (
      targetCarbonReduction !== null &&
      (typeof targetCarbonReduction !== "number" || targetCarbonReduction < 0)
    ) {
      return NextResponse.json(
        { error: "Invalid carbon reduction target value" },
        { status: 400 },
      );
    }

    const result = await updateSustainabilityTargets({
      targetEnergy,
      targetCarbonReduction,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
