import { NextResponse } from "next/server";
import { prisma } from "@/app/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const EmailSchema = z.object({
  email: z.string().email(),
  entity: z.enum(["user", "supplier", "accessory"]),
});

const entityCheckers = {
  user: (email: string) => prisma.user.findUnique({ where: { email } }),
  supplier: (email: string) => prisma.supplier.findUnique({ where: { email } }),
  accessory: async () => false, // No email check for accessory
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = EmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { email, entity } = parsed.data;
    const checker = entityCheckers[entity];
    if (!checker) {
      return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    }
    const existing = await checker(email);
    return NextResponse.json({ exists: !!existing });
  } catch (error) {
    console.error("Email validation error:", error);
    return NextResponse.json(
      { error: "Error checking email" },
      { status: 500 },
    );
  }
}
