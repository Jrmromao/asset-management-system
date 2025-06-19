import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // Validate type parameter
    if (!type || !["serialNumber", "assetName"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid validation type" },
        { status: 400 },
      );
    }

    const validationMap = {
      serialNumber: {
        value: searchParams.get("serialNumber"),
        field: "serialNumber",
      },
      assetName: {
        value: searchParams.get("assetName"),
        field: "name",
      },
    };

    const validationConfig = validationMap[type as keyof typeof validationMap];

    // If value is empty or just whitespace, return success without checking database
    if (!validationConfig.value?.trim()) {
      return NextResponse.json({
        exists: false,
      });
    }

    const existingAsset = await prisma.asset.findFirst({
      where: {
        [validationConfig.field]: validationConfig.value,
      },
    });

    return NextResponse.json({
      exists: existingAsset !== null,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
