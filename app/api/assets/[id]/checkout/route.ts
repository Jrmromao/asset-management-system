import { checkoutAsset } from "@/lib/actions/assets.actions";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const assetId = params.id;
    const { userId } = await request.json();

    if (!assetId || !userId) {
      return NextResponse.json(
        { success: false, error: "Asset ID and User ID are required" },
        { status: 400 },
      );
    }

    const response = await checkoutAsset(assetId, userId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to checkout asset" },
      { status: 500 },
    );
  }
}
