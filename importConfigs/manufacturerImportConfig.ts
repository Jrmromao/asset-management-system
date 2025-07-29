import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const manufacturerImportConfig: BulkImportConfig = {
  entityType: "manufacturer",
  fields: [
    { name: "name", label: "Manufacturer Name", type: "string", required: true },
    { name: "url", label: "Website URL", type: "string", required: true },
    { name: "supportUrl", label: "Support URL", type: "string", required: true },
    { name: "supportPhone", label: "Support Phone", type: "string", required: false },
    { name: "supportEmail", label: "Support Email", type: "string", required: false },
    { name: "active", label: "Active", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/manufacturers/import",
  templateUrl: "/manufacturers-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Manufacturer name is required"),
    url: z.string().min(1, "URL is required").url({ message: "Please enter a valid URL" }),
    supportUrl: z.string().min(1, "Support URL is required").url({ message: "Please enter a valid URL" }),
    supportPhone: z.string().optional(),
    supportEmail: z.string().email({ message: "Please enter a valid email" }).optional(),
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