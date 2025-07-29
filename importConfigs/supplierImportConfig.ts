import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";

export const supplierImportConfig: BulkImportConfig = {
  entityType: "supplier",
  fields: [
    { name: "name", label: "Company Name", type: "string", required: true },
    { name: "contactName", label: "Contact Name", type: "string", required: true },
    { name: "email", label: "Email", type: "string", required: true },
    { name: "phoneNum", label: "Phone Number", type: "string", required: false },
    { name: "url", label: "Website URL", type: "string", required: false },
    { name: "notes", label: "Notes", type: "string", required: false },
    { name: "addressLine1", label: "Address Line 1", type: "string", required: true },
    { name: "addressLine2", label: "Address Line 2", type: "string", required: false },
    { name: "city", label: "City", type: "string", required: true },
    { name: "state", label: "State", type: "string", required: true },
    { name: "zip", label: "ZIP Code", type: "string", required: true },
    { name: "country", label: "Country", type: "string", required: true },
    { name: "active", label: "Active", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/suppliers/import",
  templateUrl: "/suppliers-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Company name is required"),
    contactName: z.string().min(1, "Contact name is required"),
    email: z.string().email("Invalid email format"),
    phoneNum: z.string().optional(),
    url: z.string().optional().refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: "URL must start with http:// or https://"
    }),
    notes: z.string().optional(),
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