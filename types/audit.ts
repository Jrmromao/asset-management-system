import { JsonValue } from "@prisma/client/runtime/library";

export interface AuditLogDataAccessed {
  assetId?: string;
  previousAssignee?: string;
  [key: string]: JsonValue | undefined;
}

export type SimpleAuditLog = {
  id: string;
  companyId: string;
  createdAt: Date;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  dataAccessed: JsonValue;
  company?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
};

export type PrismaAuditLog = {
  id: string;
  companyId: string;
  createdAt: Date;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  dataAccessed: JsonValue;
}; 