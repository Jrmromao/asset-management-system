import { NextRequest, NextResponse } from "next/server";
import { listLicenseFiles } from "@/lib/actions/license.actions";
import { auth } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const licenseId = req.nextUrl.searchParams.get("licenseId");
  if (!licenseId)
    return NextResponse.json({ error: "Missing licenseId" }, { status: 400 });

  const result = await listLicenseFiles(licenseId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ data: result.data });
};
