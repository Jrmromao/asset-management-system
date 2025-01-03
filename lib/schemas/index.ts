import { z } from "zod";

const requiredString = (message: string) =>
  z.string({ required_error: message });
const nameField = (name: string) => ({
  name: requiredString(`${name} name is required`),
});

const addressFields = {
  addressLine1: requiredString("Address line 1 is required"),
  addressLine2: z.string().optional(),
  state: requiredString("State is required"),
  city: requiredString("City is required"),
  zip: requiredString("Zipcode is required"),
  country: requiredString("Country is required"),
};

const emailField = () =>
  z
    .string()
    .min(1, "Email is required")
    .email("Valid email is required")
    .optional();
// .refine(
//     async (email) => validateUnique('email', email, 'email', entity),
//     "Email already exists"
// )

const phoneNumField = z.string().min(1, "Phone number is required").optional();
// .refine(
//     async (phoneNum) => validateUnique('phoneNum', phoneNum, 'phoneNum'),
//     "Phone number already exists"
// )

const dateField = (fieldName: string) =>
  z
    .date({
      required_error: `${fieldName} is required`,
    })
    .optional();

const passwordSchema = z
  .string()
  .refine(
    (value) =>
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/.test(value),
    {
      message:
        "Password must contain at least one number, one special character, one uppercase letter, one lowercase letter, and be at least 8 characters long.",
    },
  );

// export const registerSchema = z.object({
//     email: emailField('user'),
//     password: passwordSchema,
//     repeatPassword: z.string().min(1, "Password is required"),
//     firstName: z.string().min(1, "First name is required"),
//     lastName: z.string().min(1, "Last name is required"),
//     phoneNumber: phoneNumField,
//     companyName: z.string().min(1, "Company name is required")
//         .refine(
//             async (company) =>console.log('company', company),
//             "Company name already exists"
//         )
// }).refine((data) => data.password === data.repeatPassword, {
//     message: "Passwords do not match",
//     path: ["repeatPassword"],
// });

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format")
      .refine(async (email) => {
        try {
          const response = await fetch(
            "http://localhost:3000/api/validate/email",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email }),
            },
          );

          if (!response.ok) {
            throw new Error("Validation request failed");
          }

          const data = await response.json();
          // Return true if email doesn't exist (available for registration)
          return !data.exists;
        } catch (error) {
          console.error("Email validation error:", error);
          throw new Error("Email validation failed");
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
          const response = await fetch(
            "http://localhost:3000/api/validate/company",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ company }),
            },
          );

          if (!response.ok) {
            throw new Error("Validation request failed");
          }

          const data = await response.json();
          // Return true if company doesn't exist (available for registration)
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
  .refine((data) => data.seats < data.minSeatsAlert, {
    message:
      "Min. Copies must be greater than or equal to license copies count",
    path: ["minCopiesAlert"],
  })
  .refine((data) => data.purchaseDate <= data.renewalDate, {
    message: "Renewal date must in the future",
    path: ["renewalDate"],
  });

export const accessorySchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    locationId: z.string().min(1, "Location is required"),
    modelId: z.string().min(1, "Model is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    departmentId: z.string().min(1, "Department is required"),
    price: z
      .union([z.string(), z.number()])
      .transform((value) => (typeof value === "string" ? Number(value) : value))
      .optional(),
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
    purchaseDate: z.date(),
    endOfLife: z.date(),
    alertEmail: z.string().email("Invalid email"),
    material: z.string().optional(),
    weight: z
      .union([z.string(), z.number()])
      .transform((value) => (typeof value === "string" ? Number(value) : value))
      .optional(),
    statusLabelId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.reorderPoint <= data.totalQuantityCount, {
    message: "Reorder point must be less than or equal to quantity count.",
    path: ["reorderPoint"],
  });

export const categorySchema = z.object({
  ...nameField("Category"),
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
  code: requiredString("Verification Code is required"),
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
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/assignment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: data.userId,
              itemId: data.itemId,
              type: data.type,
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Validation request failed");
        }

        const result = await response.json();
        return !result.exists;
      } catch (error) {
        console.error("Assignment validation error:", error);
        throw new Error("Unable to validate assignment");
      }
    },
    {
      message: "This item is already assigned to this user",
      path: ["itemId"], // This will show the error under the item field
    },
  );
export const manufacturerSchema = z.object({
  ...nameField("Manufacturer"),
  url: z.string().url({ message: "Invalid URL" }),
  supportUrl: requiredString("Support URL is required"),
  supportPhone: z.string().optional(),
  supportEmail: z.string().optional(),
});

export const modelSchema = z.object({
  name: requiredString("Location name is required"),
  manufacturerId: z.string().min(1, "Manufacturer is required"),
  categoryId: z.string().min(1, "Category is required"),
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

  contactName: requiredString("Contact name is required"),
  email: emailField(),
  phoneNum: z.string().optional(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
  name: z.string().min(1, "Company name is required"),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});
export const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  // email: z.string().min(1, "Email is required").email("Valid email is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .refine(async (email) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          },
        );

        if (!response.ok) {
          throw new Error("Validation request failed");
        }

        const data = await response.json();
        // Return true if email doesn't exist (available for registration)
        return !data.exists;
      } catch (error) {
        console.error("Email validation error:", error);
        throw new Error("Email validation failed");
      }
    }, "Email already exists"),
  phoneNum: z.string().min(1, "Phone number is required"),
  title: z.string().min(1, "Title is required"),
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .refine(async (employeeId) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/employeeId`,
        {
          method: "POST",
          body: JSON.stringify({ employeeId }),
        },
      );
      const exists = await res.json();
      return !exists;
    }, "Employee ID already exists"),
  roleId: z.string().min(1, "Role is required"),
});
const customFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["text", "number", "date", "select", "checkbox"]),
  value: z.union([z.string(), z.number(), z.date(), z.boolean()]).optional(),
  options: z.array(z.string()).optional(),
});
export const assetSchema = z.object({
  name: z.string().min(1, "Asset name is required"),
  purchaseDate: z.date({
    message: "Purchase Date is required.",
  }),
  serialNumber: z.string().min(1, "Serial number is required"),
  modelId: z.string().min(1, "Model is required").optional(),
  statusLabelId: z.string().min(1, "Status is required").optional(),
  departmentId: z.string().min(1, "Department is required").optional(),
  inventoryId: z.string().min(1, "Inventory is required").optional(),
  locationId: z.string().min(1, "Location is required").optional(),
  supplierId: z.string().min(1, "Supplier is required").optional(),
  price: z.union([
    z
      .string()
      .min(1, "Price is required")
      .transform((val) => {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) throw new Error("Invalid price");
        return parsed;
      }),
    z.number(),
  ]),
  weight: z.union([
    z.string().transform((val) => {
      if (!val) return undefined;
      const parsed = parseFloat(val);
      if (isNaN(parsed)) throw new Error("Invalid weight");
      return parsed;
    }),
    z.number().optional(),
  ]),
  poNumber: z.string().min(1, "PO Number is required").optional(),
  material: z.string().optional(),
  formTemplateId: z.string().optional(),
  templateValues: z.record(z.any()).optional(),
  energyRating: z.string().optional(),
  licenseId: z.string().optional(),
  dailyOperatingHours: z
    .string()
    .refine((val) => !Number.isNaN(parseInt(val, 10)), {
      // message: "Daily operating hours must be a number",
    })
    .optional(),
  customFields: z.array(customFieldSchema).optional(),
  endOfLife: dateField("End of Life"),
});
