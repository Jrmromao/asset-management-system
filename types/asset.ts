import type { Asset, User, Model, StatusLabel, Department, DepartmentLocation, FormTemplate, FormTemplateValue, AssetHistory, Co2eRecord } from "@prisma/client";
import { PrismaAuditLog, SimpleAuditLog } from "./audit";

export type AssetWithRelations = Asset & {
  assignee: Pick<User, "id" | "name"> | null;
  model: Model | null;
  statusLabel: StatusLabel | null;
  department: Department | null;
  departmentLocation: DepartmentLocation | null;
  formTemplate: (FormTemplate & { values: FormTemplateValue[] }) | null;
  formTemplateValues: FormTemplateValue[];
  auditLogs: PrismaAuditLog[];
  AssetHistory: AssetHistory[];
  Co2eRecord: Co2eRecord[];
};

export interface EnhancedAssetType {
  id: string;
  name: string;
  price: number;
  serialNumber: string;
  status: string;
  category: {
    name: string;
  };
  statusLabel: {
    name: string;
    colorCode: string;
  } | null;
  assignee?: {
    name: string;
  };
  co2Score?: {
    co2e: number;
    units: string;
  };
  model: {
    name: string;
  } | null;
  location: {
    name: string;
  } | null;
  department: {
    name: string;
  } | null;
  formTemplate: {
    id: string;
    name: string;
    values: any[];
  } | null;
  auditLogs: SimpleAuditLog[];
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  AssetHistory: AssetHistory[];
  usedBy: any[];
} 