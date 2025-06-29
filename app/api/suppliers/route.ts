import { NextRequest, NextResponse } from "next/server";
import { getAllSuppliers, insert } from "@/lib/actions/supplier.actions";

export async function GET(request: NextRequest) {
  try {
    const result = await getAllSuppliers();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, suppliers: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
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
    return NextResponse.json({ success: true, supplier: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 },
    );
  }
}
