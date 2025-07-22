import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const locationImportConfig: BulkImportConfig = {
  entityType: "location",
  fields: [
    { name: "name", label: "Location Name", type: "string", required: true },
    // Add more fields as needed
  ],
  dependencies: [],
  importApi: "/api/locations/import",
  templateUrl: "/locations-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Location name is required"),
    // Add more validations as needed
  }),
  companyId: "",
};
