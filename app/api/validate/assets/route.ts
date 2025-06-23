import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get company ID from user's private metadata
    const companyId = user.privateMetadata?.companyId as string;
    if (!companyId) {
      return NextResponse.json(
        { message: "User not associated with a company" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const assetName = searchParams.get("assetName");
    const assetTag = searchParams.get("assetTag");
    const excludeId = searchParams.get("excludeId");

    let existingAsset;

    if (type === "assetName") {
      existingAsset = await prisma.asset.findFirst({
        where: {
          name: assetName || "",
          companyId,
          id: excludeId ? { not: excludeId } : undefined,
        },
      });
    } else if (type === "assetTag") {
      existingAsset = await prisma.asset.findFirst({
        where: {
          assetTag: assetTag || "",
          companyId,
          id: excludeId ? { not: excludeId } : undefined,
        },
      });
    }

    return NextResponse.json({
      exists: existingAsset !== null,
      available: existingAsset === null,
      message: existingAsset
        ? `${type === "serialNumber" ? "Serial number" : "Asset name"} already exists in your company`
        : `${type === "serialNumber" ? "Serial number" : "Asset name"} is available`,
    });
  } catch (error) {
    console.error("Asset validation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
