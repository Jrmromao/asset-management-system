import { NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CompanySchema = z.object({
  companyName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CompanySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { companyName } = parsed.data;
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: {
          equals: companyName,
          mode: "insensitive",
        },
      },
    });
    return NextResponse.json({ exists: !!existingCompany });
  } catch (error) {
    console.error("Company validation error:", error);
    return NextResponse.json(
      { error: "Error during validation" },
      { status: 500 },
    );
  }
}
