import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serialNumber = searchParams.get("serialNumber");
    const type = searchParams.get("type");

    const session = await auth();
    if (!session?.user.companyId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate type parameter
    if (!type || !["serialNumber"].includes(type)) {
      return NextResponse.json(
        { message: "Invalid validation type" },
        { status: 400 },
      );
    }

    // Validate required parameters based on type
    if (type === "serialNumber" && !serialNumber) {
      return NextResponse.json(
        { message: "Serial number is required" },
        { status: 400 },
      );
    }
    const existingAsset = await prisma.asset.findUnique({
      where: {
        companyId: session.user.companyId,
        serialNumber: serialNumber!,
      },
    });

    return NextResponse.json({
      exists: !existingAsset,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

// export async function POST(
//   req: Request,
//   { params }: { params: { endpoint: string } },
// ) {
//   try {
//     const body = await req.json();
//     const session = await auth();
//
//     console.log(session?.user.companyId);
//     // Original validation logic for other endpoints
//     const { value, type } = body;
//
//     if (!value || !type) {
//       return NextResponse.json(
//         { error: `${value} is required` },
//         { status: 400 },
//       );
//     }
//
//     let exists = false;
//
//     switch (type) {
//       case "serialNumber":
//         const assetSerialNum = await prisma.asset.findFirst({
//           where: {
//             serialNumber: {
//               equals: value as string,
//               mode: "insensitive",
//             },
//             companyId: session?.user.companyId,
//           },
//         });
//
//         exists = assetSerialNum !== null;
//         break;
//
//       case "asset-name":
//         const assetName = await prisma.asset.findFirst({
//           where: {
//             companyId: session?.user.companyId,
//             name: {
//               equals: value as string,
//               mode: "insensitive",
//             },
//           },
//         });
//         exists = assetName !== null;
//         break;
//
//       default:
//         return NextResponse.json({ error: "Invalid request" }, { status: 400 });
//     }
//
//     return NextResponse.json({ exists });
//   } catch (error) {
//     console.error("Validation error:", error);
//     return NextResponse.json(
//       { error: "Error during validation" },
//       { status: 500 },
//     );
//   }
// }
