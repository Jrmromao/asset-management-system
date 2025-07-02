import { prisma } from "@/app/db";
import { getAuditLog } from "@/lib/actions/auditLog.actions";
import { sumSeatsAssigned } from "@/lib/utils";

// Define the EnhancedLicenseType interface here or import it from types
interface EnhancedLicenseType {
  id: string;
  name: string;
  statusLabel: {
    name: string;
    colorCode: string;
  };
  purchaseDate: Date;
  renewalDate: Date;
  co2Score?: number;
  location: {
    name: string;
  };
  department: {
    name: string;
  };
  assigneeId?: string;
  usedBy: any[];
  inventory: {
    name: string;
  };
  seats: number;
  seatsAllocated: number;
  reorderPoint: number;
  seatsAlert: string;
  supplier: any;
  poNumber: string;
  auditLogs: any[];
  Manufacturer?: any;
  licenseFiles?: any[];
}

export async function getEnhancedLicenseById(id: string, companyId: string): Promise<EnhancedLicenseType | null> {
  const license = await prisma.license.findUnique({
    where: { id, companyId },
    include: {
      statusLabel: true,
      departmentLocation: true,
      department: true,
      inventory: true,
      supplier: true,
      Manufacturer: true, // Capital M as per schema
      licenseFiles: true,
      userItems: { include: { user: true } }, // include user relation
    },
  });

  if (!license) return null;

  const auditLogsResult = await getAuditLog(id);

  return {
    id: license.id,
    name: license.name ?? "",
    co2Score: 23, // or calculate if needed
    statusLabel: {
      name: license.statusLabel?.name ?? "",
      colorCode: license.statusLabel?.colorCode ?? "#000000",
    },
    location: {
      name: license.departmentLocation?.name ?? "",
    },
    department: {
      name: license.department?.name ?? "",
    },
    purchaseDate: license.purchaseDate ?? new Date(),
    renewalDate: license.renewalDate ?? new Date(),
    inventory: {
      name: license.inventory?.name ?? "",
    },
    auditLogs: Array.isArray(auditLogsResult?.data) ? auditLogsResult.data : [],
    seats: license.seats ?? 0,
    seatsAllocated: sumSeatsAssigned((license.userItems ?? []).map(item => ({ quantity: item.quantity ?? 1 })) as any),
    reorderPoint: license.minSeatsAlert ?? 0,
    seatsAlert: license.licensedEmail ?? "",
    supplier: license.supplier ?? {},
    poNumber: license.poNumber ?? "",
    usedBy: license.userItems ?? [],
    Manufacturer: license.Manufacturer ?? undefined,
    licenseFiles: license.licenseFiles ?? [],
  };
}

export async function getAllEnhancedLicenses(companyId: string): Promise<EnhancedLicenseType[]> {
  const licenses = await prisma.license.findMany({
    where: { companyId },
    include: {
      statusLabel: true,
      departmentLocation: true,
      department: true,
      inventory: true,
      supplier: true,
      Manufacturer: true, // Capital M as per schema
      licenseFiles: true,
      userItems: { include: { user: true } }, // include user relation
    },
  });

  // Optionally, fetch audit logs for each license (could be slow for many licenses)
  // For now, set auditLogs to [] for performance, or fetch in parallel if needed
  return licenses.map((license) => ({
    id: license.id,
    name: license.name ?? "",
    co2Score: 23, // or calculate if needed
    statusLabel: {
      name: license.statusLabel?.name ?? "",
      colorCode: license.statusLabel?.colorCode ?? "#000000",
    },
    location: {
      name: license.departmentLocation?.name ?? "",
    },
    department: {
      name: license.department?.name ?? "",
    },
    purchaseDate: license.purchaseDate ?? new Date(),
    renewalDate: license.renewalDate ?? new Date(),
    inventory: {
      name: license.inventory?.name ?? "",
    },
    auditLogs: [], // Optionally fetch with Promise.all if needed
    seats: license.seats ?? 0,
    seatsAllocated: sumSeatsAssigned((license.userItems ?? []).map(item => ({ quantity: item.quantity ?? 1 })) as any),
    reorderPoint: license.minSeatsAlert ?? 0,
    seatsAlert: license.licensedEmail ?? "",
    supplier: license.supplier ?? {},
    poNumber: license.poNumber ?? "",
    usedBy: license.userItems ?? [],
    Manufacturer: license.Manufacturer ?? undefined,
    licenseFiles: license.licenseFiles ?? [],
  }));
}

export async function getEnhancedLicenseAfterCheckin(licenseId: string, companyId: string) {
  return getEnhancedLicenseById(licenseId, companyId);
}

export async function getEnhancedLicenseAfterCheckout(licenseId: string, companyId: string) {
  return getEnhancedLicenseById(licenseId, companyId);
} 