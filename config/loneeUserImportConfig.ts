import { z } from "zod";

export const loneeUserImportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  roleId: z.string().min(1, "Role is required"),
  departmentId: z.string().optional(),
});

export const loneeUserImportConfig = {
  entityType: "lonee-user",
  fields: [
    { name: "name", label: "Name", type: "string", required: true },
    { name: "email", label: "Email", type: "string", required: true },
    { name: "roleId", label: "Role", type: "string", required: true },
    { name: "departmentId", label: "Department", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/users/create-lonee",
  templateUrl: "/templates/lonee-user-import.csv",
  validationSchema: loneeUserImportSchema,
  companyId: "", // Set dynamically if needed
}; 