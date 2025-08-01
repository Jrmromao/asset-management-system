import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth, currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { userId: assigneeUserId, itemId, type } = body;

    if (!assigneeUserId || !itemId || !type) {
      return NextResponse.json(
        { message: "User ID, Item ID, and type are required" },
        { status: 400 },
      );
    }

    // Map itemId to the correct field for future-proofing
    const itemField: {
      licenseId?: string;
      accessoryId?: string;
      assetId?: string;
    } = {};
    if (type === "license") {
      itemField.licenseId = itemId;
    } else if (type === "accessory") {
      itemField.accessoryId = itemId;
    } else if (type === "asset") {
      itemField.assetId = itemId;
    }

    let existingAssignment;

    if (type === "license") {
      // For licenses, check if user already has a seat for this license
      existingAssignment = await prisma.userItem.findFirst({
        where: {
          userId: assigneeUserId,
          ...itemField,
          itemType: "LICENSE",
          companyId,
        },
      });
    } else if (type === "accessory") {
      // For accessories, check if user already has this accessory assigned
      existingAssignment = await prisma.userItem.findFirst({
        where: {
          userId: assigneeUserId,
          ...itemField,
          itemType: "ACCESSORY",
          companyId,
        },
      });
    } else if (type === "asset") {
      // For assets, check if user already has this asset assigned
      existingAssignment = await prisma.userItem.findFirst({
        where: {
          userId: assigneeUserId,
          ...itemField,
          itemType: "ASSET",
          companyId,
        },
      });
    }

    return NextResponse.json({
      exists: existingAssignment !== null,
      available: existingAssignment === null,
      message: existingAssignment
        ? `This ${type} is already assigned`
        : `This ${type} is available for assignment`,
    });
  } catch (error) {
    console.error("Assignment validation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
