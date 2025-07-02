import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/db";
import { parse } from "csv-parse/sync";
import { getAuth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
const LicenseImportSchema = z.object({
  name: z.string().min(1),
  licensedEmail: z.string().email(),
  poNumber: z.string().optional().default(""),
  seats: z.coerce.number().min(1),
  minSeatsAlert: z.coerce.number().min(0).default(0),
  alertRenewalDays: z.coerce.number().min(0).default(0),
  purchaseDate: z.string().optional(),
  renewalDate: z.string().optional(),
  statusLabelId: z.string().optional(),
  supplierId: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  inventoryId: z.string().optional(),
  purchaseNotes: z.string().optional(),
  licenseUrl: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
  renewalPrice: z.coerce.number().optional(),
  monthlyPrice: z.coerce.number().optional(),
  annualPrice: z.coerce.number().optional(),
  pricePerSeat: z.coerce.number().optional(),
  billingCycle: z.string().optional(),
  currency: z.string().optional(),
  discountPercent: z.coerce.number().optional(),
  taxRate: z.coerce.number().optional(),
  utilizationRate: z.coerce.number().optional(),
  costCenter: z.string().optional(),
  budgetCode: z.string().optional(),
});

type LicenseImportInput = z.infer<typeof LicenseImportSchema>;

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    const json = await req.json();
    const { fileContent } = json;
    if (!fileContent) {
      return NextResponse.json({ success: false, message: "No file content provided" }, { status: 400 });
    }
    // Parse CSV
    let records: Record<string, string>[] = [];
    try {
      records = parse(fileContent, { columns: true, skip_empty_lines: true }) as Record<string, string>[];
    } catch (e) {
      return NextResponse.json({ success: false, message: "Invalid CSV format" }, { status: 400 });
    }
    // Get companyId from Clerk claims
    const companyId = (sessionClaims?.privateMetadata as { companyId?: string } | undefined)?.companyId;    if (!companyId) {
      return NextResponse.json({ success: false, message: "No companyId found in user metadata" }, { status: 400 });
    }
    let successCount = 0;
    let errorRows: { row: number; error: string }[] = [];
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      // Parse/validate
      const parsed = LicenseImportSchema.safeParse(row);
      if (!parsed.success) {
        errorRows.push({ row: i + 2, error: parsed.error.errors.map(e => e.message).join(", ") });
        continue;
      }
      let data: LicenseImportInput = parsed.data;
      // Convert empty strings to null for foreign keys
      const clean = <T extends string | undefined>(v: T) => (v && v.trim() !== "" ? v : null);
      const toDate = (v?: string) => (v ? new Date(v) : undefined);
      try {
        const licenseData: Prisma.LicenseCreateInput = {
          name: data.name,
          licensedEmail: data.licensedEmail,
          poNumber: data.poNumber ?? "",
          seats: data.seats,
          minSeatsAlert: data.minSeatsAlert,
          alertRenewalDays: data.alertRenewalDays,
          purchaseDate: data.purchaseDate ? toDate(data.purchaseDate)! : new Date(),
          renewalDate: data.renewalDate ? toDate(data.renewalDate)! : new Date(),
          company: {
            connect: {
              id: companyId,
            },
          },
          statusLabel: data.statusLabelId ? { connect: { id: data.statusLabelId } } : undefined,
          supplier: data.supplierId ? { connect: { id: data.supplierId } } : undefined,
          department: data.departmentId ? { connect: { id: data.departmentId } } : undefined,
          purchaseNotes: data.purchaseNotes,
          licenseUrl: data.licenseUrl,
          purchasePrice: data.purchasePrice ?? 0,
          renewalPrice: data.renewalPrice,
          monthlyPrice: data.monthlyPrice,
          annualPrice: data.annualPrice,
          pricePerSeat: data.pricePerSeat,
          billingCycle: data.billingCycle,
          currency: data.currency,
          discountPercent: data.discountPercent,
          taxRate: data.taxRate,
          utilizationRate: data.utilizationRate,
          costCenter: data.costCenter,
          budgetCode: data.budgetCode,
        };
        await prisma.license.create({ data: licenseData });
        successCount++;
      } catch (e: any) {
        errorRows.push({ row: i + 2, error: e.message });
      }
    }
    return NextResponse.json({ success: true, message: `Imported ${successCount} licenses.`, errors: errorRows });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Server error" }, { status: 500 });
  }
} 