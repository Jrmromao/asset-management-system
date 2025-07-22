import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";
import { manufacturerSchema } from "@/lib/schemas";

export const manufacturerImportConfig: BulkImportConfig = {
  entityType: "manufacturer",
  fields: [
    { name: "name", label: "Manufacturer Name", type: "string", required: true },
    { name: "url", label: "URL", type: "string", required: true },
    { name: "supportUrl", label: "Support URL", type: "string", required: true },
    { name: "supportPhone", label: "Support Phone", type: "string", required: false },
    { name: "supportEmail", label: "Support Email", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/manufacturers/import",
  templateUrl: "/manufacturers-template.csv",
  validationSchema: manufacturerSchema,
  companyId: "",
}; 