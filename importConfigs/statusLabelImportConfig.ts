import { BulkImportConfig } from "@/types/importConfig";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";

export const statusLabelImportConfig: BulkImportConfig = {
  entityType: "statusLabel",
  fields: [
    { name: "name", label: "Status Label Name", type: "string", required: true },
    { name: "description", label: "Description", type: "string", required: false },
    { name: "colorCode", label: "Color Code", type: "string", required: false },
    { name: "isArchived", label: "Is Archived", type: "string", required: false },
    { name: "allowLoan", label: "Allow Loan", type: "string", required: false },
  ],
  dependencies: [],
  importApi: "/api/status-labels/import",
  templateUrl: "/status-labels-template.csv",
  validationSchema: statusLabelSchema,
  companyId: "",
}; 