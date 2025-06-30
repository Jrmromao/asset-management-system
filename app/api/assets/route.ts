import { NextResponse } from "next/server";
import { z } from "zod";
import { getAllAssets, createAsset } from "@/lib/actions/assets.actions";
import { auth } from "@clerk/nextjs/server";
import { assetListQuerySchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assetTag: z.string().min(1, "Asset Tag is required"),
  modelId: z.string().min(1, "Model is required"),
  statusLabelId: z.string().min(1, "Status is required"),
  departmentId: z.string().min(1, "Department is required"),
  inventoryId: z.string().min(1, "Inventory is required"),
  locationId: z.string().min(1, "Location is required"),
  formTemplateId: z.string().min(1, "Form Template is required"),
});

export async function GET(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Parse query params
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    // Validate and coerce types
    const parsed = assetListQuerySchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const assetsResponse = await getAllAssets();
    if (!assetsResponse.success) {
      return NextResponse.json(
        { error: assetsResponse.error },
        { status: 500 },
      );
    }
    return NextResponse.json({
      data: assetsResponse.data,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = assetSchema.safeParse(json);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const assetResponse = await createAsset(validatedData.data);

    if (!assetResponse.success) {
      return NextResponse.json({ error: assetResponse.error }, { status: 500 });
    }

    return NextResponse.json({ data: assetResponse.data });
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 },
    );
  }
}
