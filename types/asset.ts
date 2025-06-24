import {
  Asset,
  FormTemplateValue,
  Department,
  Inventory,
  DepartmentLocation,
  Model,
  StatusLabel,
  Co2eRecord,
  AssetHistory,
  User,
  Supplier,
  Manufacturer,
  Category,
  AuditLog,
  FormTemplate,
  PurchaseOrder,
} from "@prisma/client";

export type {
  Asset,
  FormTemplateValue,
  Department,
  Inventory,
  DepartmentLocation,
  AssetHistory,
} from "@prisma/client";

export type AssetWithRelations = Asset & {
  model: Model & {
    manufacturer: Manufacturer;
    category: Category;
  };
  statusLabel: StatusLabel;
  department: Department | null;
  departmentLocation: DepartmentLocation | null;
  inventory: Inventory | null;
  values: FormTemplateValue[];
  co2eRecords: Co2eRecord[];
  assetHistory: AssetHistory[];
  user: User | null;
  supplier: Supplier | null;
  auditLogs: AuditLog[];
  formTemplate: FormTemplate | null;
  purchaseOrder: PurchaseOrder | null;
};

// This is used for the detail view page
export interface EnhancedAssetType {
  id: string;
  name: string;
  assetTag: string;
  status: string;
  purchaseDate?: Date;
  warrantyEndDate?: Date;
  notes?: string;
  supplier?: { name: string } | null;
  purchaseOrderNumber?: string | null;
  category: { name: string };
  statusLabel: StatusLabel | null;
  user?: { name: string | null } | null;
  co2Score?: {
    co2e: number;
    units: string;
  };
  model: (Model & { manufacturer: Manufacturer; category: Category }) | null;
  departmentLocation: DepartmentLocation | null;
  department: Department | null;
  formTemplate: {
    id: string;
    name: string;
    values: any[];
  } | null;
  assetHistory: AssetHistory[];
  price: number | null;
  auditLogs: AuditLog[];
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  co2eRecords?: Co2eRecord[];
  purchaseCost?: number | null;
  energyConsumption?: number | null;
  expectedLifespan?: number | null;
  endOfLifePlan?: string | null;
}

export type CreateAssetInput = Omit<
  Asset,
  "id" | "purchaseDate" | "createdAt" | "updatedAt"
>;

export type AssetResponse = {
  success: boolean;
  data: AssetWithRelations[];
  error?: string;
};
