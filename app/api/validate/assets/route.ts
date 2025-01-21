import { NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: { endpoint: string } },
) {
  try {
    const body = await req.json();
    const session = await auth();

    console.log(session?.user.companyId);
    // Original validation logic for other endpoints
    const { value, type } = body;

    if (!value || !type) {
      return NextResponse.json(
        { error: `${value} is required` },
        { status: 400 },
      );
    }

    let exists = false;

    switch (type) {
      case "serialNumber":
        const assetSerialNum = await prisma.asset.findFirst({
          where: {
            serialNumber: {
              equals: value as string,
              mode: "insensitive",
            },
            companyId: session?.user.companyId,
          },
        });

        exists = assetSerialNum !== null;
        break;

      case "asset-name":
        const assetName = await prisma.asset.findFirst({
          where: {
            companyId: session?.user.companyId,
            name: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });
        exists = assetName !== null;
        break;

      default:
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Error during validation" },
      { status: 500 },
    );
  }
}
