import { updateUserNotes } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await context.params;
    const { notes, actorId } = await request.json();
    if (!userId || typeof notes !== "string") {
      return NextResponse.json(
        { success: false, error: "User ID and notes are required" },
        { status: 400 },
      );
    }
    const result = await updateUserNotes(userId, notes, actorId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
