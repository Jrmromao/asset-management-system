import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";
import { inventorySchema } from "@/lib/schemas";

export const inventoryImportConfig: BulkImportConfig = {
  entityType: "inventory",
  fields: [
    { name: "name", label: "Inventory Name", type: "string", required: true },
  ],
  dependencies: [],
  importApi: "/api/inventories/import",
  templateUrl: "/inventories-template.csv",
  validationSchema: inventorySchema,
  companyId: "",
};
