import { z } from "zod";
import { BulkImportConfig } from "@/types/importConfig";

export const loneeUserImportSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  employeeId: z.string().optional(),
  role: z.string().min(1, "Role is required"),
});

export const loneeUserImportConfig: BulkImportConfig = {
  entityType: "lonee-user",
  fields: [
    { name: "firstName", label: "First Name", type: "string", required: true },
    { name: "lastName", label: "Last Name", type: "string", required: true },
    { name: "email", label: "Email", type: "string", required: true },
    {
      name: "employeeId",
      label: "Employee ID",
      type: "string",
      required: false,
    },
    { name: "role", label: "Role", type: "string", required: true },
  ],
  dependencies: [],
  importApi: "/api/users/create-lonee",
  templateUrl: "/lonee-user-template.csv",
  validationSchema: loneeUserImportSchema,
  companyId: "", // Set dynamically if needed
};
