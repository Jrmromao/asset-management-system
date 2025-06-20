import {
  AuditLog,
  Company,
  Department,
  DepartmentLocation,
  Inventory,
  LicenseSeat,
  StatusLabel,
  Supplier,
  UserItem,
} from "@prisma/client";

export type License = {
  id: string;
  name: string;
  notes?: string | null;
  companyId: string;
  statusLabelId?: string | null;
  supplierId?: string | null;
  departmentId?: string | null;
  departmentLocationId?: string | null;
  inventoryId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  company: Company;
  statusLabel?: StatusLabel | null;
  supplier?: Supplier | null;
  department?: Department | null;
  departmentLocation?: DepartmentLocation | null;
  inventory?: Inventory | null;
  LicenseSeat: LicenseSeat[];
  userItems: UserItems[];

  // Computed fields
  stockHistory: LicenseSeat[];
  auditLogs: AuditLog[];
  userLicenses: UserItems[];
  currentAssignments: UserItems[];
};
