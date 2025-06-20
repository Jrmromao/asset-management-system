import {
  findAssetById,
  removeAsset,
  updateAsset,
} from "@/lib/actions/assets.actions";
import { NextResponse } from "next/server";

export async function GET(
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

    const response = await findAssetById(assetId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Get asset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch asset" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const response = await removeAsset(assetId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete asset" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const assetId = params.id;
    const body = await request.json();

    if (!assetId) {
      return NextResponse.json(
        { success: false, error: "Asset ID is required" },
        { status: 400 },
      );
    }

    const response = await updateAsset(assetId, body);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update asset" },
      { status: 500 },
    );
  }
}
