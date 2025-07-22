import { z } from "zod";
import { BulkImportConfig } from "@/types/importConfig";
import { modelSchema } from "@/lib/schemas";

export const modelImportConfig: BulkImportConfig = {
  entityType: "model",
  fields: [
    { name: "name", label: "Model Name", type: "string", required: true },
    { name: "modelNo", label: "Model Number", type: "string", required: true },
    {
      name: "manufacturerId",
      label: "Manufacturer",
      type: "string",
      required: true,
    },
    { name: "active", label: "Active", type: "string", required: false },
    {
      name: "endOfLife",
      label: "End of Life",
      type: "string",
      required: false,
    },
    { name: "notes", label: "Notes", type: "string", required: false },
    { name: "imageUrl", label: "Image URL", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/models/import",
  templateUrl: "/models-template.csv",
  validationSchema: modelSchema,
  companyId: "",
};
 