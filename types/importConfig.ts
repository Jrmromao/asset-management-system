import { ZodSchema } from "zod";

export interface ImportField {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "enum";
  required: boolean;
  options?: string[]; // for enums
}

export interface ImportDependency {
  name: string;
  label: string;
  api: string;
  createApi: string;
}

export interface BulkImportConfig {
  entityType: string;
  fields: ImportField[];
  dependencies: ImportDependency[];
  importApi: string;
  templateUrl: string;
  validationSchema: ZodSchema<any>;
} 