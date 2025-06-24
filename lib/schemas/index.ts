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
      .refine(
        async (email) => {
          try {
            const response = await fetch(`${baseUrl}/api/validate/email-test`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, entity: "user" }),
            });
            if (!response.ok) throw new Error("Validation request failed");
            const data = await response.json();
            return !data.exists;
          } catch (error) {
            console.error("Email validation error:", error);
            return false;
          }
        },
        { message: "Email already exists" },
      ),
    password: passwordSchema,
    repeatPassword: z.string().min(1, "Password is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(2, "Last name must be at least 2 characters long"),
    phoneNumber: z.string().optional(),
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters long"),
    recaptchaToken: z.string().nonempty("Please complete the reCAPTCHA"),
    primaryContactEmail: z.string().email("Invalid email address"),
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
    purchaseDate: z.date().optional(),
    renewalDate: z.date().optional(),
    statusLabelId: z.string().min(1, "Status is required"),
    alertRenewalDays: z
      .string()
      .refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Alert renewal days is required",
      }),
    
    // Enhanced pricing fields
    purchasePrice: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Purchase price must be a valid number",
      }),
    renewalPrice: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Renewal price must be a valid number",
      }),
    monthlyPrice: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Monthly price must be a valid number",
      }),
    annualPrice: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Annual price must be a valid number",
      }),
    pricePerSeat: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Price per seat must be a valid number",
      }),
    billingCycle: z.enum(["monthly", "annual", "one-time"]).optional().default("annual"),
    currency: z.string().optional().default("USD"),
    discountPercent: z
      .string()
      .optional()
      .refine((val) => !val || (!Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100), {
        message: "Discount must be between 0 and 100",
      }),
    taxRate: z
      .string()
      .optional()
      .refine((val) => !val || (!Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
        message: "Tax rate must be a positive number",
      }),
    
    // Usage and optimization fields
    lastUsageAudit: z.date().optional(),
    utilizationRate: z
      .string()
      .optional()
      .refine((val) => !val || (!Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 1), {
        message: "Utilization rate must be between 0 and 1",
      }),
    costCenter: z.string().optional(),
    budgetCode: z.string().optional(),
    
    poNumber: z.string().optional(),
    notes: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    locationId: z.string().min(1, "Location is required"),
    supplierId: z.string().optional(),
    attachments: z.array(z.any()).optional(),
  })
  .refine(
    (data) => parseInt(data.seats, 10) > parseInt(data.minSeatsAlert, 10),
    {
      message: "License copies count must be greater than min. copies alert",
      path: ["seats"],
    },
  )
  .refine((data) => !data.purchaseDate || !data.renewalDate || data.purchaseDate <= data.renewalDate, {
    message: "Renewal date must be after purchase date",
    path: ["renewalDate"],
  });
// .refine((data) => data.purchaseDate <= data.renewalDate, {
//   message: "Renewal date must be in the future",
//   path: ["renewalDate"],
// });

export const accessorySchema = z
  .object({
    categoryId: z.string().min(1, "Category is required"),
    name: z.string().min(2, "Name must be at least 2 characters long"),
    serialNumber: z.string().min(1, "Serial number is required"),
    modelNumber: z.string().min(1, "Model number is required"),
    statusLabelId: z.string().min(1, "Status is required"),
    departmentId: z.string().min(1, "Department is required"),
    supplierId: z.string().optional(),
    locationId: z.string().min(1, "Location is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    
    // Enhanced pricing fields
    price: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Price must be a valid number",
      }),
    unitCost: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Unit cost must be a valid number",
      }),
    totalValue: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Total value must be a valid number",
      }),
    currency: z.string().optional().default("USD"),
    depreciationRate: z
      .string()
      .optional()
      .refine((val) => !val || (!Number.isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 1), {
        message: "Depreciation rate must be between 0 and 1",
      }),
    currentValue: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Current value must be a valid number",
      }),
    replacementCost: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Replacement cost must be a valid number",
      }),
    averageCostPerUnit: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Average cost per unit must be a valid number",
      }),
    lastPurchasePrice: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Last purchase price must be a valid number",
      }),
    costCenter: z.string().optional(),
    budgetCode: z.string().optional(),
    
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
    poNumber: z.string().optional(),
    purchaseDate: z.date().optional(),
    endOfLife: z.date().optional(),
    alertEmail: z.string().email("Invalid email"),
    material: z.string().optional(),
    weight: z
      .string()
      .optional()
      .refine((val) => !val || !Number.isNaN(parseFloat(val)), {
        message: "Weight must be a valid number",
      }),
    notes: z.string().optional(),
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
  description: z.string().optional(),
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
  url: z
    .string()
    .min(1, "URL is required")
    .url({ message: "Please enter a valid URL" }),
  supportUrl: z
    .string()
    .min(1, "Support URL is required")
    .url({ message: "Please enter a valid URL" }),
  supportPhone: z.string().optional(),
  supportEmail: z
    .string()
    .email({ message: "Please enter a valid email" })
    .optional(),
});

export const modelSchema = z.object({
  name: z.string().min(1, "Model name is required"),
  modelNo: z.string().min(1, "Model number is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  active: z.boolean().default(true),
  endOfLife: z.date().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  companyId: z.string().optional(),
});

export const locationSchema = z.object({
  ...nameField("Location name"),
  ...addressFields,
});

export const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
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

const validationResults = new Map<string, boolean>();

export const validateField = async (
  field: string,
  value: string,
  endpoint: string,
) => {
  const cacheKey = `${field}:${value}`;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();

    validationResults.set(cacheKey, !data.exists);
    return !data.exists;
  } catch (error) {
    console.error(`Validation error for ${field}:`, error);
    return false;
  }
};

export const getValidationResult = (field: string, value: string) => {
  return validationResults.get(`${field}:${value}`);
};

export const assetSchema = z.object({
  assetTag: z.string().min(1, "Serial Number is required"),
  name: z.string().min(1, "Asset name is required"),
  modelId: z.string().min(1, "Model is required"),
  statusLabelId: z.string().min(1, "Status is required"),
  departmentId: z.string().min(1, "Department is required"),
  inventoryId: z.string().min(1, "Inventory is required"),
  locationId: z.string().min(1, "Location is required"),
  formTemplateId: z.string().min(1, "Category template is required"),
  templateValues: z.record(z.any()).optional(),
  customFields: z.array(z.any()).optional(),
  purchaseOrderId: z.string().optional(),
  notes: z.string().optional(),
  energyConsumption: z.number().optional(),
  expectedLifespan: z.number().optional(),
  endOfLifePlan: z.string().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  fields: z.array(
    z.object({
      name: z.string().min(1, "Field name is required"),
      label: z.string().min(1, "Field label is required"),
      type: z.enum(["number", "boolean", "text", "select", "date", "checkbox"]),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      placeholder: z.string().optional(),
      showIf: z.record(z.array(z.string())).optional(),
    }),
  ),
});
