import { checkinAsset } from "@/lib/actions/assets.actions";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const assetId = params.id;

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: "Asset ID is required" },
        { status: 400 },
      );
    }

    const response = await checkinAsset(assetId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Checkin error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to checkin asset" },
      { status: 500 },
    );
  }
}
