import { NextResponse } from "next/server";
import { prisma } from "@/app/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { phoneNum } = await req.json();

    const existingUser = await prisma.user.findFirst({
      where: { phoneNum: phoneNum },
    });

    return NextResponse.json(!!existingUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Error checking phone number" },
      { status: 500 },
    );
  }
}
