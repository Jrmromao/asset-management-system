import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const assetCategoryImportConfig: BulkImportConfig = {
  entityType: "assetCategory",
  fields: [
    { name: "name", label: "Category Name", type: "string", required: true },
    // Add more fields if your form template requires them
  ],
  dependencies: [],
  importApi: "/api/categories/import", // Adjust if you have a different endpoint
  templateUrl: "/asset-categories-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Category name is required"),
    // Add more validations if needed
  }),
  companyId: "", // Will be set dynamically in AdminSettings
};
