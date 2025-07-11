import { prisma } from "@/app/db";
import { getAuditLog } from "@/lib/actions/auditLog.actions";
import { sumUnitsAssigned } from "@/lib/utils";

export interface EnhancedAccessoryType {
  id: string;
  name: string;
  category: { name: string } | null;
  statusLabel: { name: string; colorCode: string } | null;
  modelNumber: string | null;
  location: { name: string } | null;
  department: { name: string } | null;
  createdAt: Date;
  updatedAt: Date;
  inventory: { name: string } | null;
  totalQuantity: number;
  reorderPoint: number;
  unitsAllocated: number;
  alertEmail: string;
  supplier: { name: string } | null;
  poNumber: string | null;
  auditLogs: any[];
  usedBy: any[];
  co2Score?: number;
  belowReorderPoint: boolean;
}

export async function getEnhancedAccessoryById(
  id: string,
  companyId: string,
): Promise<EnhancedAccessoryType | null> {
  const accessory = await prisma.accessory.findUnique({
    where: { id, companyId },
    include: {
      category: true,
      statusLabel: true,
      departmentLocation: true,
      department: true,
      inventory: true,
      supplier: true,
      userItems: { include: { user: true, accessory: true, company: true } },
    },
  });
  if (!accessory) return null;

  const auditLogsResult = await getAuditLog(id);
  const unitsAllocated = sumUnitsAssigned((accessory.userItems as any[]) ?? []);
  const totalQuantity = accessory.totalQuantityCount ?? 0;
  const reorderPoint = accessory.reorderPoint ?? 0;
  const belowReorderPoint =
    reorderPoint > 0 && totalQuantity - unitsAllocated < reorderPoint;

  // Ensure usedBy array is always well-formed and strictly typed
  const usedBy = ((accessory.userItems as any[]) ?? []).map((item) => ({
    ...item,
    user: {
      id: item.user && typeof item.user.id === "string" ? item.user.id : "",
      name:
        item.user && typeof item.user.name === "string" ? item.user.name : "-",
      employeeId:
        item.user && typeof item.user.employeeId === "string"
          ? item.user.employeeId
          : "-",
      title:
        item.user && typeof item.user.title === "string"
          ? item.user.title
          : "-",
    },
    accessory:
      item.accessory && typeof item.accessory.id === "string"
        ? item.accessory
        : { id: "", name: "-" },
    company:
      item.company && typeof item.company.id === "string"
        ? item.company
        : { id: "", name: "-" },
    quantity: typeof item.quantity === "number" ? item.quantity : 0,
    assignedAt:
      item.assignedAt instanceof Date && !isNaN(item.assignedAt)
        ? item.assignedAt
        : null,
    returnedAt:
      item.returnedAt instanceof Date && !isNaN(item.returnedAt)
        ? item.returnedAt
        : null,
    notes: typeof item.notes === "string" ? item.notes : "",
  }));

  return {
    id: accessory.id,
    name: accessory.name,
    co2Score: 0, // or calculate if needed
    category: (accessory as any).category
      ? { name: (accessory as any).category.name }
      : null,
    modelNumber: accessory.modelNumber || null,
    statusLabel: (accessory as any).statusLabel
      ? {
          name: (accessory as any).statusLabel.name,
          colorCode: (accessory as any).statusLabel.colorCode,
        }
      : null,
    location: (accessory as any).departmentLocation
      ? { name: (accessory as any).departmentLocation.name }
      : null,
    department: (accessory as any).department
      ? { name: (accessory as any).department.name }
      : null,
    unitsAllocated,
    createdAt: accessory.createdAt,
    updatedAt: accessory.updatedAt,
    alertEmail: accessory.alertEmail,
    inventory: (accessory as any).inventory
      ? { name: (accessory as any).inventory.name }
      : null,
    poNumber: accessory.poNumber || null,
    reorderPoint,
    supplier: (accessory as any).supplier
      ? { name: (accessory as any).supplier.name }
      : null,
    totalQuantity,
    auditLogs: Array.isArray(auditLogsResult?.data) ? auditLogsResult.data : [],
    usedBy,
    belowReorderPoint,
  } as EnhancedAccessoryType;
}
