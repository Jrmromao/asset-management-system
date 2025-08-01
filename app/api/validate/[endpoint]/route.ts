import { NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";

export async function POST(
  req: Request,
  contextPromise: Promise<{ params: { endpoint: string } }>,
) {
  const { params } = await contextPromise;
  try {
    const body = await req.json();

    if (params.endpoint === "assignment") {
      const { accessoryId, licenseId } = body;
      const whereClause: any = {};

      if (accessoryId) {
        whereClause.accessoryId = accessoryId;
      }
      if (licenseId) {
        whereClause.licenseId = licenseId;
      }

      const existingAssignment = await prisma.userItem.findFirst({
        where: whereClause,
      });

      const exists = existingAssignment !== null;
      return NextResponse.json({ exists });
    }

    if (params.endpoint === "asset-tag") {
      const { assetTag, excludeId } = body;
      const whereClause: any = {
        assetTag: {
          equals: assetTag,
          mode: "insensitive",
        },
      };

      if (excludeId) {
        whereClause.id = { not: excludeId };
      }

      const existingAsset = await prisma.asset.findFirst({
        where: whereClause,
      });

      const exists = existingAsset !== null;
      return NextResponse.json({ exists });
    }

    // Special handling for status label validation
    if (params.endpoint === "status-label") {
      const { name, excludeId } = body;

      if (!name) {
        return NextResponse.json(
          { error: "name is required" },
          { status: 400 },
        );
      }

      // Define the handler function
      const validateStatusLabel = withAuth(async (user: any) => {
        if (!user.user_metadata?.companyId) {
          return {
            success: false,
            error: "User not associated with company",
            data: null,
          };
        }

        const whereClause: any = {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
          companyId: user.user_metadata.companyId,
        };

        // Exclude current item if updating
        if (excludeId) {
          whereClause.id = { not: excludeId };
        }

        const existingStatusLabel = await prisma.statusLabel.findFirst({
          where: whereClause,
        });

        return {
          success: true,
          data: {
            exists: existingStatusLabel !== null,
          },
        };
      });

      // Call the wrapped function
      const authResult = await validateStatusLabel();

      if (!authResult.success) {
        return NextResponse.json({ error: authResult.error }, { status: 401 });
      }

      // We can safely assume data is not null here because success is true
      return NextResponse.json({ exists: authResult.data!.exists });
    }

    // Original validation logic for other endpoints
    const [field, value] = Object.entries(body)[0];

    if (!value) {
      return NextResponse.json({ error: `${field} is required` });
    }

    const modelName = params.endpoint as keyof typeof prisma;
    if (!modelName || !prisma[modelName]) {
      return NextResponse.json({ error: "Invalid endpoint" });
    }

    const model = prisma[modelName] as any;

    const whereClause: any = {
      [field]: {
        equals: value,
        mode: "insensitive",
      },
    };

    if (body.excludeId) {
      whereClause.id = { not: body.excludeId };
    }

    const record = await model.findFirst({
      where: whereClause,
    });

    return NextResponse.json({ exists: record !== null });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
