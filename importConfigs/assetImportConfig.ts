import { z } from "zod";
import { BulkImportConfig } from "@/types/importConfig";

export const assetImportConfig: BulkImportConfig = {
  entityType: "asset",
  fields: [
    {
      name: "name",
      label: "Asset Name",
      type: "string",
      required: true,
    },
    {
      name: "assetTag",
      label: "Asset Tag",
      type: "string",
      required: true,
    },
    {
      name: "modelName",
      label: "Model",
      type: "string",
      required: false,
    },
    {
      name: "categoryName",
      label: "Category",
      type: "string",
      required: false,
    },
    {
      name: "statusLabelName",
      label: "Status Label",
      type: "string",
      required: false,
    },
    {
      name: "purchaseDate",
      label: "Purchase Date",
      type: "string",
      required: false,
    },
    {
      name: "endOfLife",
      label: "End of Life",
      type: "string",
      required: false,
    },
    {
      name: "purchasePrice",
      label: "Purchase Price",
      type: "number",
      required: false,
    },
    {
      name: "supplierName",
      label: "Supplier",
      type: "string",
      required: false,
    },
    {
      name: "departmentName",
      label: "Department",
      type: "string",
      required: false,
    },
    {
      name: "locationName",
      label: "Location",
      type: "string",
      required: false,
    },
    {
      name: "notes",
      label: "Notes",
      type: "string",
      required: false,
    },
  ],
  dependencies: [
    {
      name: "modelName",
      label: "Model",
      api: "/api/models",
      createApi: "/api/models",
    },
    {
      name: "categoryName",
      label: "Category",
      api: "/api/categories",
      createApi: "/api/categories",
    },
    {
      name: "statusLabelName",
      label: "Status Label",
      api: "/api/status-labels",
      createApi: "/api/status-labels",
    },
    {
      name: "supplierName",
      label: "Supplier",
      api: "/api/suppliers",
      createApi: "/api/suppliers",
    },
    {
      name: "departmentName",
      label: "Department",
      api: "/api/departments",
      createApi: "/api/departments",
    },
    {
      name: "locationName",
      label: "Location",
      api: "/api/locations",
      createApi: "/api/locations",
    },
  ],
  importApi: "/api/assets/import",
  templateUrl: "/data/assets-sample-template.csv",
  validationSchema: z.object({
    name: z.string().min(1, "Asset name is required"),
    assetTag: z.string().min(1, "Asset tag is required"),
    modelName: z.string().optional(),
    categoryName: z.string().optional(),
    statusLabelName: z.string().optional(),
    purchaseDate: z.string().optional(),
    endOfLife: z.string().optional(),
    purchasePrice: z.coerce.number().optional(),
    supplierName: z.string().optional(),
    departmentName: z.string().optional(),
    locationName: z.string().optional(),
    notes: z.string().optional(),
  }),
};

