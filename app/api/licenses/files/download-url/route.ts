import { NextRequest, NextResponse } from "next/server";
import { getLicenseFileDownloadUrl } from "@/lib/actions/license.actions";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fileId = req.nextUrl.searchParams.get("fileId");
  if (!fileId)
    return NextResponse.json({ error: "Missing fileId" }, { status: 400 });

  const result = await getLicenseFileDownloadUrl(fileId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ data: result.data });
};
