import { NextRequest, NextResponse } from "next/server";
import { getAllStatusLabels, insert } from "@/lib/actions/statusLabel.actions";

export async function GET(request: NextRequest) {
  try {
    const result = await getAllStatusLabels();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, statusLabels: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch status labels" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await insert(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, statusLabel: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create status label" },
      { status: 500 },
    );
  }
}
