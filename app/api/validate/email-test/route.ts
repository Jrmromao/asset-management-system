import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const entityCheckers = {
  user: (email: string) => prisma.user.findUnique({ where: { email } }),
  supplier: (email: string) => prisma.supplier.findUnique({ where: { email } }),
  accessory: () => false,
};

export async function POST(req: Request) {
  try {
    console.log(req);

    // const { email } = await req.json();
    // const { searchParams } = new URL(req.url);
    // const entity = searchParams.get('entity');
    //
    // if (!entity) {
    //     return NextResponse.json({ error: "Entity is required" }, { status: 400 });
    // }
    //
    // const checker = entityCheckers[entity as keyof typeof entityCheckers];
    //
    // if (!checker) {
    //     return NextResponse.json({ error: "Invalid entity" }, { status: 400 });
    // }
    //
    // const existing = await checker(email);
    // return NextResponse.json(!!existing);
  } catch (error) {
    return NextResponse.json(
      { error: "Error checking email" },
      { status: 500 },
    );
  }
}
