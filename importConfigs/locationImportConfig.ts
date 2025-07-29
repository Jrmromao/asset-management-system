import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const locationImportConfig: BulkImportConfig = {
  entityType: "location",
  fields: [
    { name: "name", label: "Location Name", type: "string", required: true },
    { name: "addressLine1", label: "Address Line 1", type: "string", required: true },
    { name: "addressLine2", label: "Address Line 2", type: "string", required: false },
    { name: "city", label: "City", type: "string", required: true },
    { name: "state", label: "State", type: "string", required: true },
    { name: "zip", label: "ZIP Code", type: "string", required: true },
    { name: "country", label: "Country", type: "string", required: true },
    { name: "active", label: "Active", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/locations/import",
  templateUrl: "/locations-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Location name is required"),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip: z.string().min(1, "ZIP code is required"),
    country: z.string().min(1, "Country is required"),
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
