import {
  getUserById,
  remove,
  update,
  deactivateUser,
  activateUser,
} from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const response = await getUserById(userId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await context.params;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const response = await remove(userId);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await context.params;
    const { actorId, companyId, action } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }
    if (action === "deactivate") {
      if (!actorId || !companyId) {
        return NextResponse.json(
          { success: false, error: "actorId and companyId are required" },
          { status: 400 },
        );
      }
      const result = await deactivateUser(userId, actorId, companyId);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true });
    } else if (action === "activate") {
      if (!actorId || !companyId) {
        return NextResponse.json(
          { success: false, error: "actorId and companyId are required" },
          { status: 400 },
        );
      }
      const result = await activateUser(userId, actorId, companyId);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Unsupported action" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Deactivate user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await context.params;
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 },
      );
    }

    const response = await update(userId, body);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 },
    );
  }
}
