import { z } from "zod";
import {
  addressFields,
  emailField,
  nameField,
  passwordSchema,
  phoneNumField,
} from "./schema-utils";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

const customFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "date", "select", "checkbox"]),
  value: z.union([z.string(), z.number(), z.date(), z.boolean()]).optional(),
  options: z.array(z.string()).optional(),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .refine(async (email) => {
        try {
          const response = await fetch(`${baseUrl}/api/validate/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!response.ok) throw new Error("Validation request failed");
          const data = await response.json();
          return !data.exists;
        } catch (error) {
          console.error("Email validation error:", error);
        }
      }, "Email already exists"),
    password: passwordSchema,
    repeatPassword: z.string().min(1, "Password is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: phoneNumField,
    recaptchaToken: z
      .string()
      .min(1, "Please complete the captcha verification"),
    companyName: z
      .string()
      .min(1, "Company name is required")
      .refine(async (company) => {
        try {
          const response = await fetch(`${baseUrl}/api/validate/company`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ company }),
          });
          if (!response.ok) throw new Error("Validation request failed");
          const data = await response.json();
          return !data.exists;
        } catch (error) {
          console.error("Company validation error:", error);
          throw new Error("Company validation failed");
        }
      }, "Company name already exists"),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
  });

export const licenseSchema = z
  .object({
    licenseName: z.string().min(1, "License name is required"),
    seats: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
      message: "License copies count is required",
    }),
    minSeatsAlert: z
      .string()
      .refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Min. copies alert is required",
      }),
    licensedEmail: z.string().email("Valid email is required"),
    purchaseDate: z.date(),
    renewalDate: z.date(),
    statusLabelId: z.string().min(1, "Status is required"),
    alertRenewalDays: z
      .string()
      .refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Alert renewal days is required",
      }),
    purchasePrice: z
      .string()
      .refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Purchase price is required",
      }),
    poNumber: z.string().min(1, "PO number is required"),
    notes: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    locationId: z.string().min(1, "Location is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    attachments: z.array(z.any()).optional(),
  })
  .refine(
    (data) => parseInt(data.seats, 10) > parseInt(data.minSeatsAlert, 10),
    {
      message: "License copies count must be greater than min. copies alert",
      path: ["seats"],
    },
  )
  .refine((data) => data.purchaseDate <= data.renewalDate, {
    message: "Renewal date must be in the future",
    path: ["renewalDate"],
  });

export const accessorySchema = z
  .object({
    categoryId: z.string().min(1, "Category is required"),
    name: z.string().min(1, "Name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    modelNumber: z.string().min(1, "Model number is required"),
    statusLabelId: z.string().min(1, "Status is required"),
    departmentId: z.string().min(1, "Department is required"),
    // supplierId: z.string().min(1, "Supplier is required"),
    locationId: z.string().min(1, "Location is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    // price: z
    //   .union([z.string(), z.number()])
    //   .transform((value) => (typeof value === "string" ? Number(value) : value))
    //   .optional(),
    totalQuantityCount: z
      .union([z.string(), z.number()])
      .transform((value) =>
        typeof value === "string" ? Number(value) : value,
      ),
    reorderPoint: z
      .union([z.string(), z.number()])
      .transform((value) =>
        typeof value === "string" ? Number(value) : value,
      ),
    // poNumber: z.string().optional(),
    // purchaseDate: z.date(),
    // endOfLife: z.date(),
    alertEmail: z.string().email("Invalid email"),
    // material: z.string().optional(),
    // weight: z
    //   .union([z.string(), z.number()])
    //   .transform((value) => (typeof value === "string" ? Number(value) : value))
    //   .optional(),
    // notes: z.string().optional(),
  })
  .refine((data) => data.reorderPoint <= data.totalQuantityCount, {
    message: "Reorder point must be less than or equal to quantity count.",
    path: ["reorderPoint"],
  });

export const categorySchema = z.object({
  ...nameField("Category"),
});

export const roleSchema = z.object({
  ...nameField("role"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Valid email is required"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, { message: "Password is required" }),
});

export const accountVerificationSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Valid email is required"),
  code: z.string().min(1, "Verification Code is required"),
});

export const forgotPasswordConfirmSchema = z
  .object({
    email: z.string().optional(),
    code: z.string().min(1, "Verification Code is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Repeat password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Valid email is required"),
});

export const statusLabelSchema = z.object({
  ...nameField("Status Label"),
  description: z.string().min(1, "Description is required"),
  colorCode: z.string().optional(),
  isArchived: z.boolean().optional(),
  allowLoan: z.boolean().optional(),
});

export const kitSchema = z.object({
  name: z.string().min(1, "Kit name is required"),
  assetId: z.string().optional(),
  accessoryId: z.string().optional(),
  licenseId: z.string().optional(),
});

export const kitItemSchema = z.object({
  itemID: z.string().optional(),
});

export const unassignSchema = z.object({
  itemId: z.string(),
  userId: z.string(),
  notes: z.string().optional(),
});

export const assignmentSchema = z
  .object({
    userId: z.string().min(1, "Item ID is required"),
    itemId: z.string().min(1, "Item ID is required"),
    type: z.enum(["asset", "license", "accessory", "consumable"]),
    seatsRequested: z.number().optional().default(1),
  })
  .refine(
    async (data) => {
      try {
        const response = await fetch(`${baseUrl}/api/validate/assignment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.userId,
            itemId: data.itemId,
            type: data.type,
          }),
        });
        if (!response.ok) throw new Error("Validation request failed");
        const result = await response.json();
        return !result.exists;
      } catch (error) {
        console.error("Assignment validation error:", error);
        throw new Error("Unable to validate assignment");
      }
    },
    {
      message: "This item is already assigned to this user",
      path: ["userId"],
    },
  );

export const manufacturerSchema = z.object({
  ...nameField("Manufacturer"),
  url: z.string().url({ message: "Invalid URL" }),
  supportUrl: z.string().min(1, "Support URL is required"),
  supportPhone: z.string().optional(),
  supportEmail: z.string().optional(),
});

export const modelSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  modelNo: z.string().min(1, "Model number is required"),
  endOfLife: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const locationSchema = z.object({
  ...nameField("Location"),
  ...addressFields,
});

export const inventorySchema = z.object({
  ...nameField("Inventory"),
});

export const departmentSchema = z.object({
  ...nameField("Department"),
});

export const supplierSchema = z.object({
  ...nameField("Supplier"),
  contactName: z.string().min(1, "Contact name is required"),
  email: emailField(),
  phoneNum: z.string().optional(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
  name: z.string().min(1, "Company name is required"),
  ...addressFields,
});

export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .refine(async (email) => {
      try {
        const response = await fetch(`${baseUrl}/api/validate/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) return false;
        const data = await response.json();
        return !data.exists;
      } catch (error) {
        console.error("Email validation error:", error);
        return false;
      }
    }, "Email already exists"),
  title: z.string().min(1, "Title is required"),
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .refine(async (employeeId) => {
      try {
        const response = await fetch(`${baseUrl}/api/validate/employeeId`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!response.ok) return false;
        const data = await response.json();
        return !data.exists;
      } catch (error) {
        console.error("EmployeeId validation error:", error);
        return false;
      }
    }, "Employee ID already exists"),
  roleId: z.string().min(1, "Role is required"),
});

export const assetValidationSchema = z.object({
  type: z.enum(["serialNum", "name"]),
  value: z.string().min(1, "Value is required"),
});

export const assetSchema = z.object({
  serialNumber: z
    .string()
    .min(1, "Serial Number is required")
    .refine(
      async (serialNumber) => {
        try {
          const response = await fetch(`${baseUrl}/api/validate/assets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: serialNumber, type: "serialNumber" }),
            credentials: "same-origin",
            cache: "no-store",
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          return !data.exists;
        } catch (error) {
          console.error("Asset serial number validation error:", error); // Fixed error message
          return false;
        }
      },
      { message: "Serial number already exists" }, // Fixed message format
    ),
  name: z
    .string()
    .min(1, "Asset name is required")
    .refine(
      async (name) => {
        try {
          const response = await fetch(`${baseUrl}/api/validate/assets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: name, type: "asset-name" }),
            credentials: "same-origin",
            cache: "no-store",
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          return !data.exists;
        } catch (error) {
          console.error("Asset name validation error:", error); // Fixed error message
          return false;
        }
      },
      { message: "Asset name already exists" }, // Fixed message format
    ),

  modelId: z.string().min(1, "Model is required"),
  statusLabelId: z.string().min(1, "Status is required"),
  departmentId: z.string().min(1, "Department is required"),
  inventoryId: z.string().min(1, "Inventory is required"),
  locationId: z.string().min(1, "Location is required"),
  formTemplateId: z.string(),
  templateValues: z.record(z.any()).optional(),
  customFields: z.array(customFieldSchema).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Field name is required"),
      type: z.enum(["text", "number", "date", "select", "checkbox"]),
      placeholder: z.string().optional(),
      label: z.string().optional(),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    }),
  ),
});
