import { NextRequest, NextResponse } from "next/server";
import { getAll, insert } from "@/lib/actions/department.actions";

export async function GET(request: NextRequest) {
  try {
    const result = await getAll();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, departments: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch departments" },
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
    return NextResponse.json({ success: true, department: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create department" },
      { status: 500 },
    );
  }
}
