import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Optionally support search param in the future
    const result = await getAll();
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, manufacturers: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch manufacturers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Only require name for quick-add, but allow more fields
    const { name, supportEmail, supportPhone } = body;
    const result = await insert({ name, supportEmail, supportPhone });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, manufacturer: result.data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create manufacturer" }, { status: 500 });
  }
}
function insert(arg0: { name: any; supportEmail: any; supportPhone: any; }) {
    throw new Error("Function not implemented.");
}

function getAll() {
    throw new Error("Function not implemented.");
}

