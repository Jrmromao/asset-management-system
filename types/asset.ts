import type {
  Asset as PrismaAsset,
  User,
  Model,
  StatusLabel,
  Department,
  DepartmentLocation,
  FormTemplate,
  FormTemplateValue,
  AssetHistory,
  Co2eRecord,
} from "@prisma/client";
import { PrismaAuditLog, SimpleAuditLog } from "./audit";

export type Asset = PrismaAsset & {
  model?: {
    id: string;
    name: string;
  } | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
  } | null;
  supplier?: {
    id: string;
    name: string;
  } | null;
  departmentLocation?: {
    id: string;
    name: string;
  } | null;
  statusLabel?: {
    id: string;
    name: string;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
  inventory?: {
    id: string;
    name: string;
  } | null;
};

export type AssetWithRelations = Asset & {
  user?: User;
  model?: Model;
  statusLabel?: StatusLabel;
  department?: Department;
  departmentLocation?: DepartmentLocation;
  formTemplate?: FormTemplate;
  formTemplateValues?: FormTemplateValue[];
  assetHistory?: AssetHistory[];
  co2eRecords?: Co2eRecord[];
  auditLogs?: PrismaAuditLog[];
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

export type AssetResponse = {
  success: boolean;
  data: Asset[];
  error?: string;
};
