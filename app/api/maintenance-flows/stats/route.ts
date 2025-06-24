"use server";

import { NextRequest, NextResponse } from "next/server";
import { getMaintenanceFlowStats } from "@/lib/actions/maintenanceFlow.actions";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getMaintenanceFlowStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching maintenance flow stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance flow stats" },
      { status: 500 },
    );
  }
}
