import { NextRequest, NextResponse } from "next/server";
import { getAll, createUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const users = await getAll();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUser = await createUser(body);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user", details: error.message },
      { status: 500 },
    );
  }
}
