import { NextRequest, NextResponse } from "next/server";
import { uploadLicenseFile } from "@/lib/actions/license.actions";
import { auth } from "@clerk/nextjs/server";
import { isUserAdminOrManager } from "@/lib/utils/user";

export const POST = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Permission check
  const isAllowed = await isUserAdminOrManager(userId);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "You do not have permission to upload files." },
      { status: 403 },
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const licenseId = formData.get("licenseId") as string;

  if (!file || !licenseId) {
    return NextResponse.json(
      { error: "Missing file or licenseId" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadLicenseFile(licenseId, {
    buffer,
    originalname: file.name,
    mimetype: file.type,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ data: result.data });
};
