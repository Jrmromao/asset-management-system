import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";
import { departmentSchema } from "@/lib/schemas";

export const departmentImportConfig: BulkImportConfig = {
  entityType: "department",
  fields: [
    { name: "name", label: "Department Name", type: "string", required: true },
  ],
  dependencies: [],
  importApi: "/api/departments/import",
  templateUrl: "/departments-template.csv",
  validationSchema: departmentSchema,
  companyId: "",
}; 