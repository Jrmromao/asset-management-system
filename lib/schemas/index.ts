import { z } from "zod";

const requiredString = (message: string) => z.string({ required_error: message });
const nameField = (name: string) => ({
    name: requiredString(`${name} name is required`)
});




const addressFields = {
    addressLine1: requiredString("Address line 1 is required"),
    addressLine2: z.string().optional(),
    state: requiredString("State is required"),
    city: requiredString("City is required"),
    zip: requiredString('Zipcode is required'),
    country: requiredString('Country is required')
};

const emailField = z.string().email()
    .min(1, "Email is required")
    .email("Invalid email");

const dateField = (fieldName: string) => z.date({
    required_error: `${fieldName} is required`
});

const passwordSchema = z.string().refine(
    (value) => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/.test(value),
    {
        message: "Password must contain at least one number, one special character, one uppercase letter, one lowercase letter, and be at least 8 characters long.",
    }
);

// Merged and refined schemas
export const accessorySchema_ = z.object({
    title: requiredString("Accessory Title is required"),
    totalQuantityCount: z.number({ required_error: "Quantity count is required" })
        .transform((value) => Number(value))
        .refine((value) => value >= 1, { message: "Quantity count must be at least 1" }),
    minQuantityAlert: z.number({ required_error: "Min. quantity is required" })
        .transform((value) => Number(value))
        .refine((value) => value >= 1, { message: "Min. quantity must be at least 1" }),
    alertEmail: emailField,
    categoryId: z.string().optional(),
    endOfLife: dateField('End of Life'),
    companyId: z.string().optional(),
    material: z.string().optional(),
    poNumber: z.string().optional(),
    price: z.number().optional(),
    vendor: requiredString("Vendor is required"),

    purchaseDate: dateField("Purchase date"),
    description: z.string().optional()
}).refine((data) => data.minQuantityAlert <= data.totalQuantityCount, {
    message: "Min. quantity must be less than or equal to quantity count.",
    path: ["minQuantityAlert"],
});


export const accessorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    categoryId: z.string().min(1, "Category is required"),
    manufacturerId: z.string().min(1, "Manufacturer is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    price: z.string().min(0, "Price must be positive").transform(value => Number(value)),
    poNumber: z.string().optional(),
    purchaseDate: z.date(),
    endOfLife: z.date(),
    vendor: z.string().optional(),
    alertEmail: z.string().email("Invalid email"),
    reorderPoint: z.string({ required_error: "Reorder point is required" })
        .transform((value) => Number(value))
        .refine((value) => value >= 1, { message: "Reorder point must be at least 1" }),
    totalQuantityCount: z.string({ required_error: "Quantity count is required" })
        .transform((value) => Number(value))
        .refine((value) => value >= 1, { message: "Quantity count must be at least 1" }),
    material: z.string().optional(),
    weight: z.string().optional().transform((value) => Number(value)),
    // dimensions: z.string().optional(),
    type: z.string(),
    statusLabelId: z.string(),
    notes: z.string().optional(),
}).refine((data) => data.reorderPoint <= data.totalQuantityCount, {
    message: "Reorder point must be less than or equal to quantity count.",
    path: ["minQuantityAlert"],
});




export const licenseSchema = z.object({
    licenseName: requiredString("License name is required"),
    licenseCopiesCount: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "License copies count is required"
    }),
    minCopiesAlert: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Min. copies alert is required"
    }),
    licensedEmail: emailField,
    renewalDate: dateField("Renewal date"),
    purchaseDate: dateField("Purchase date"),
    alertRenewalDays: requiredString("Alert renewal days is required"),
    purchasePrice: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Purchase price is required"
    }),
    vendor: z.string().min(1, "Vendor is required"),
    licenseKey: z.string().min(1, "Product key is required"),
    notes: z.string().optional()
}).refine((data) => data.licenseCopiesCount > data.minCopiesAlert, {
    message: "Min. Copies must be greater than or equal to license copies count",
    path: ["minCopiesAlert"],
}).refine((data) => data.purchaseDate <= data.renewalDate, {
    message: "Renewal date must in the future",
    path: ["renewalDate"],
});

export const categorySchema = z.object({
    ...nameField('Category')
});

export const loginSchema = z.object({
    email: emailField,
    password: z.string({ required_error: "Password is required" })
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password must not exceed 20 characters" }),
});

export const accountVerificationSchema = z.object({
    email: emailField,
    code: requiredString("Verification Code is required")
});

export const forgotPasswordConfirmSchema = z.object({
    email: z.string().optional(),
    code: z.string().min(1, "Verification Code is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Repeat password is required"),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
});

export const forgotPasswordSchema = z.object({
    email: emailField
});

export const registerSchema = z.object({
    email: emailField,
    password: passwordSchema,
    repeatPassword: z.string().min(1, "Password is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    companyName: z.string().min(1, "Company name is required"),
}).refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
});

export const statusLabelSchema = z.object({
    ...nameField('Status Label'),
    description: z.string().min(1, "Description is required"),
    colorCode: z.string().optional(),
    isArchived: z.boolean().optional(),
    allowLoan: z.boolean().optional(),
});

export const personSchema = z.object({
    id: z.string().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: emailField,
    roleId: z.string().min(1, "Role is required"),
    companyId: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    employeeId: z.string().min(1, "Employee Id is required"),
});

export const kitSchema = z.object({
    name: z.string().min(1, "Kit name is required"),
    assetId: z.string().optional(),
    accessoryId: z.string().optional(),
    licenseId: z.string().optional(),
});

export const kitItemSchema = z.object({
    itemID: z.string().optional()
});

export const assetAssignSchema = z.object({
    assetId: z.string().optional(),
    userId: z.string().min(1, "User is required"),
});

export const manufacturerSchema = z.object({
    ...nameField('Manufacturer'),

    url: z.string().url({message: "Invalid URL"}),
    supportUrl: requiredString('Support URL is required'),
    supportPhone: z.string().optional(),
    supportEmail: z.string().optional()
});

export const modelSchema = z.object({
    name: requiredString('Location name is required'),
    manufacturerId: z.string().min(1, "Manufacturer is required"),
    categoryId: z.string().min(1, "Category is required"),
    modelNo: z.string().min(1, "Model number is required"),
    endOfLife: z.string().optional(),
    notes: z.string().optional(),
    imageUrl: z.string().optional()

});

export const locationSchema = z.object({
    ...nameField('Location'),
    ...addressFields
});

export const inventorySchema = z.object({
    ...nameField('Inventory'),
});

export const departmentSchema = z.object({
    ...nameField('Department'),
});

export const supplierSchema = z.object({
    ...nameField('Supplier'),
    contactName: requiredString('Contact name is required'),
    email: emailField,
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
    email: emailField,
    phoneNum: z.string().min(1, "Phone number is required"),
    title: z.string().min(1, "Title is required"),
    employeeId: z.string().min(1, "Employee ID is required"),
    roleId: z.string().min(1, "Role is required"),
    companyId: z.string().optional()
});