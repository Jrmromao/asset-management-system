import { NextRequest, NextResponse } from "next/server";
import { deleteLicenseFile } from "@/lib/actions/license.actions";
import { auth } from "@clerk/nextjs/server";
import { isUserAdminOrManager } from "@/lib/utils/user";

export const POST = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Permission check
  const isAllowed = await isUserAdminOrManager(userId);
  if (!isAllowed) {
    return NextResponse.json({ error: "You do not have permission to delete files." }, { status: 403 });
  }

  const { fileId } = await req.json();
  if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  const result = await deleteLicenseFile(fileId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}; 