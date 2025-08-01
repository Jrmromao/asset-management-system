import { NextRequest, NextResponse } from "next/server";
import { getAll, insert } from "@/lib/actions/location.actions";

export async function GET(request: NextRequest) {
  try {
    const result = await getAll();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, locations: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
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
    return NextResponse.json({ success: true, location: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create location" },
      { status: 500 },
    );
  }
}
