import { NextRequest, NextResponse } from "next/server";
import { getAll, insert } from "@/lib/actions/manufacturer.actions";

export async function GET(request: NextRequest) {
  try {
    // Optionally support search param in the future
    const result = await getAll();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, manufacturers: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch manufacturers" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, supportUrl, supportPhone, supportEmail } = body;
    if (!name || !url || !supportUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, url, supportUrl",
        },
        { status: 400 },
      );
    }
    const result = await insert({
      name,
      url,
      supportUrl,
      supportPhone,
      supportEmail,
    });
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, manufacturer: result.data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create manufacturer" },
      { status: 500 },
    );
  }
}
