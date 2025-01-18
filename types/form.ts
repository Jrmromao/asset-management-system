export interface CustomFieldOption {
  id: string;
  name: string;
}

export interface CustomField {
  name: string;
  label: string;
  type: "text" | "select" | "date" | "number" | "checkbox";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  fields: CustomField[];
}

import { z } from "zod";
import { assetSchema } from "@/lib/schemas";

export type AssetFormValues = z.infer<typeof assetSchema>;

export interface FormTemplate {
  id: string;
  name: string;
  fields: CustomField[];
}

export interface CollapsibleSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
  isComplete?: boolean;
}

export interface FormSection {
  id: string;
  label: string;
  description: string;
  isComplete: boolean;
}

export interface AssetFormProps {
  id?: string;
  isUpdate?: boolean;
}

export type CustomFieldValues = Record<string, string>;
