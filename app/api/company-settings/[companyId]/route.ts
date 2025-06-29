import { getCompanySettings, updateCompanySettings } from "@/lib/services/companySettings.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const settings = await getCompanySettings(params.companyId);
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
  const data = await req.json();
  const updated = await updateCompanySettings(params.companyId, data);
  return NextResponse.json(updated);
}