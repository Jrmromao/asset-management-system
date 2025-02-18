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
    // Special handling for assignment validation
    if (params.endpoint === "assignment") {
      const { userId, itemId, type } = body;

      if (!userId || !itemId || !type) {
        return NextResponse.json(
          { error: "userId, itemId, and type are required" },
          { status: 400 },
        );
      }

      let exists = false;

      switch (type) {
        case "accessory":
          const existingAccessory = await prisma.userItem.findFirst({
            where: {
              AND: [{ userId: userId }, { accessoryId: itemId }],
            },
          });
          exists = existingAccessory !== null;
          break;

        case "license":
          const existingLicense = await prisma.userItem.findFirst({
            where: {
              AND: [{ userId: userId }, { licenseId: itemId }],
            },
          });
          exists = existingLicense !== null;
          break;
        case "asset":
          const existingAsset = await prisma.asset.findFirst({
            where: {
              AND: [{ assigneeId: userId }, { id: itemId }],
            },
          });

          console.log(existingAsset);

          exists = existingAsset !== null;
          break;

        default:
          return NextResponse.json(
            { error: "Invalid assignment type" },
            { status: 400 },
          );
      }

      return NextResponse.json({ exists });
    }

    // Original validation logic for other endpoints
    const [field, value] = Object.entries(body)[0];

    if (!value) {
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 },
      );
    }

    let exists = false;

    switch (params.endpoint) {
      case "company":
        const company = await prisma.company.findFirst({
          where: {
            name: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });
        exists = company !== null;
        break;

      case "employeeId":
        const employeeCheck = await prisma.user.findFirst({
          where: {
            companyId: session?.user.companyId,
            employeeId: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });
        exists = employeeCheck !== null;
        break;

      case "email":
        const user = await prisma.user.findFirst({
          where: {
            email: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });
        exists = user !== null;
        break;

      case "serialNum":
        const assetSerialNumber = await prisma.asset.findFirst({
          where: {
            serialNumber: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });

        // const accessorySerialNumber = await prisma.accessory.findFirst({
        //   where: {
        //     serialNumber: {
        //       equals: value as string,
        //       mode: "insensitive",
        //     },
        //   },
        // });

        exists = assetSerialNumber !== null;
        break;

      case "poNumber":
        const assetPONumber = await prisma.asset.findFirst({
          where: {
            companyId: session?.user.companyId,
            poNumber: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });

        const accessoryPONumber = await prisma.accessory.findFirst({
          where: {
            companyId: session?.user.companyId,
            poNumber: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });

        const licensePONumber = await prisma.license.findFirst({
          where: {
            companyId: session?.user.companyId,
            poNumber: {
              equals: value as string,
              mode: "insensitive",
            },
          },
        });

        exists =
          assetPONumber !== null ||
          accessoryPONumber !== null ||
          licensePONumber !== null;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid endpoint" },
          { status: 400 },
        );
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
