// app/api/validate/assets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { auth } from "@/auth";
import { assetValidationSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = assetValidationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { type, value } = result.data;

    const exists =
      (await prisma.asset.findFirst({
        where: { serialNumber: value, companyId: session.user.companyId },
      })) !== null;
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Error during validation" },
      { status: 500 },
    );
  }
}
