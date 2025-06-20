import {
  getRoleById,
  remove,
  update,
} from "@/lib/actions/role.actions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = params.id;
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: "Role ID is required" },
        { status: 400 },
      );
    }

    const response = await getRoleById(roleId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Get role error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch role" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = params.id;
    if (!roleId) {
      return NextResponse.json(
        { success: false, error: "Role ID is required" },
        { status: 400 },
      );
    }

    const response = await remove(roleId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete role" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const roleId = params.id;
    const body = await request.json();

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: "Role ID is required" },
        { status: 400 },
      );
    }

    const response = await update(roleId, body);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update role" },
      { status: 500 },
    );
  }
}
