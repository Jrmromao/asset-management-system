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
  licensedEmail: string;
  poNumber: string;
  companyId: string;
  statusLabelId?: string | null;
  supplierId?: string | null;
  departmentId?: string | null;
  locationId?: string | null;
  inventoryId?: string | null;
  renewalDate: Date;
  purchaseDate: Date;
  purchaseNotes?: string | null;
  licenseUrl?: string | null;
  minSeatsAlert: number;
  alertRenewalDays: number;
  seats: number;
  purchasePrice: number;
  
  // Enhanced pricing fields
  renewalPrice?: number | null;
  monthlyPrice?: number | null;
  annualPrice?: number | null;
  pricePerSeat?: number | null;
  billingCycle?: string | null;
  currency?: string | null;
  discountPercent?: number | null;
  taxRate?: number | null;
  
  // Usage and optimization fields
  lastUsageAudit?: Date | null;
  utilizationRate?: number | null;
  costCenter?: string | null;
  budgetCode?: string | null;
  
  createdAt: Date;
  updatedAt: Date;

  company: Company;
  statusLabel?: StatusLabel | null;
  supplier?: Supplier | null;
  department?: Department | null;
  departmentLocation?: DepartmentLocation | null;
  inventory?: Inventory | null;
  LicenseSeat: LicenseSeat[];
  userItems: UserItem[];

  // Computed fields
  stockHistory: LicenseSeat[];
  auditLogs: AuditLog[];
  userLicenses: UserItem[];
  currentAssignments: UserItem[];
  licenseFiles?: {
    id: string;
    licenseId: string;
    fileUrl: string;
    fileName: string;
    uploadedAt: string;
    uploadedBy?: string | null;
  }[];
};
