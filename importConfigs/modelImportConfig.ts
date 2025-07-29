import { z } from "zod";
import { BulkImportConfig } from "@/types/importConfig";

export const modelImportConfig: BulkImportConfig = {
  entityType: "model",
  fields: [
    { name: "name", label: "Model Name", type: "string", required: true },
    { name: "modelNo", label: "Model Number", type: "string", required: true },
    {
      name: "manufacturerName",
      label: "Manufacturer Name",
      type: "string",
      required: true,
    },
    { name: "active", label: "Active", type: "string", required: false },
    { name: "notes", label: "Notes", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/models/import",
  templateUrl: "/models-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Model name is required"),
    modelNo: z.string().min(1, "Model number is required"),
    manufacturerName: z.string().min(1, "Manufacturer name is required"),
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
    notes: z.string().optional(),
  }),
  companyId: "",
};
 