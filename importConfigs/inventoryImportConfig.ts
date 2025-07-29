import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const inventoryImportConfig: BulkImportConfig = {
  entityType: "inventory",
  fields: [
    { name: "name", label: "Inventory Name", type: "string", required: true },
    { name: "active", label: "Active", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/inventory/import",
  templateUrl: "/inventories-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Inventory name is required"),
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
