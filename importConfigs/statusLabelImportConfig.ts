import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";

export const statusLabelImportConfig: BulkImportConfig = {
  entityType: "statusLabel",
  fields: [
    { name: "name", label: "Status Label Name", type: "string", required: true },
    { name: "description", label: "Description", type: "string", required: false },
    { name: "active", label: "Active", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/status-labels/import",
  templateUrl: "/status-labels-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Status label name is required"),
    description: z.string().optional(),
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