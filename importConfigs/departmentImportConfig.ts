import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const departmentImportConfig: BulkImportConfig = {
  entityType: "department",
  fields: [
    { name: "name", label: "Department Name", type: "string", required: true },
    { name: "active", label: "Active", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/departments/import",
  templateUrl: "/departments-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Department name is required"),
    active: z
      .union([
        z.boolean(),
        z.string().transform((val) => {
          if (val === "true" || val === "1" || val === "yes") return true;
          if (val === "false" || val === "0" || val === "no") return false;
          return true; // default to true
        }),
      ])
      .default(true),
  }),
  companyId: "",
};
