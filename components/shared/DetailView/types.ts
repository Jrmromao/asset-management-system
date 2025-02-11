import { ReactNode } from "react";

export type AssetType = {
  id: string;
  name: string;
  price: number;
  serialNumber: string;
  category?: {
    name: string;
  };
  statusLabel?: {
    name: string;
    colorCode: string;
  };
  assignee?: {
    name: string;
  };
  assigneeId?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface DetailField {
  label: string;
  value: string | number | undefined;
  type?: "text" | "date" | "currency" | "status";
}

export interface DetailViewProps {
  title: string | ReactNode;
  fields: DetailField[];
  isAssigned?: boolean;
  isLoading?: boolean;
  co2Score: {
    co2e: number;
    units: string;
  };
  units: string;
  qrCode?: string | ReactNode;
  breadcrumbs?: ReactNode;
  error?: string | null;
  sourceData?: string;
  customFormFields?: ReactNode;
  actions?: {
    onArchive?: () => void;
    onAssign?: () => void;
    onUnassign?: () => void;
    onDuplicate?: () => void;
    onEdit?: () => void;
    onPrintLabel?: () => void;
  };
  asset?: AssetType;
  checkoutDisabled?: boolean;
}
