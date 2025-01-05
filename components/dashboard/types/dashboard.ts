// types/dashboard.ts
import { ReactNode } from "react";

export interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue?: string;
  subtitle: string;
  icon: ReactNode;
}

export interface AssetTypeCardProps {
  icon: ReactNode;
  name: string;
  devices: number;
  usage: number;
  status: "Healthy" | "Warning" | "Critical";
}

export interface AlertItemProps {
  type: "warning" | "info" | "success";
  message: string;
}

export interface MaintenanceTaskProps {
  assetName: string;
  type: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  impact: number;
}

export interface StatCardProps {
  title: string;
  mainValue: string | number;
  subValue?: string;
  subtitle: string;
  icon: ReactNode;
}

export interface AlertItemProps {
  type: "warning" | "info" | "success";
  message: string;
}
