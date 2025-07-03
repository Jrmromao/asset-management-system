import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId, firstName, lastName } = await req.json();
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, { firstName, lastName });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
