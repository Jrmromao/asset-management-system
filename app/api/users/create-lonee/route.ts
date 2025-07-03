import { NextRequest, NextResponse } from "next/server";
import { createLoneeUser } from "@/lib/actions/user.actions";

export async function POST(req: NextRequest) {
  try {
    const { name, email, roleId, departmentId } = await req.json();
    if (!name || !email || !roleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const newUser = await createLoneeUser({
      name,
      email,
      roleId,
      departmentId,
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating lonee user:", error);
    return NextResponse.json(
      { error: "Failed to create lonee user", details: error.message },
      { status: 500 },
    );
  }
}
