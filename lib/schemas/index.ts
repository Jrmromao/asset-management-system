import {z} from "zod";


export const AssetSchema = z.object({
    title: z.string({required_error: "Accessory Title is required"}),
    totalQuantityCount: z.string({required_error: "Quantity count is required"})
        .transform((value) => Number(value))
        .refine((value) => value >= 1, {message: "Quantity count must be at least 1"}),
    minQuantityAlert: z.string({required_error: "Min. quantity is required"})
        .transform((value) => Number(value))
        .refine((value) => value >= 1, {message: "Min. quantity must be at least 1"}),
    alertEmail: z.string({required_error: "Email is required"}).email({message: "Invalid email"}),
    vendor: z.string({required_error: "Vendor is required"}),
    purchaseDate: z.date({
        required_error: "Purchase date is required",
    }),
    description: z.string().optional()
})
    .refine((data) => data.minQuantityAlert <= data.totalQuantityCount, {
        message: "Min. quantity must be less than or equal to quantity count.",
        path: ["minQuantityAlert"],
    })


export const licenseSchema = z.object({

    licenseName: z.string({
        required_error: "License name is required",
    }),

    licenseCopiesCount: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "License copies count is required"
    }),
    minCopiesAlert: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Min. copies alert is required"
    }),
    licensedEmail: z.string({
        required_error: "Licensed email is required",
    }).email({
        message: "Invalid email"
    }),
    renewalDate: z.date({
        required_error: "Renewal date is required"}),
    purchaseDate: z.date({
        required_error: "Purchase date is required",
    }),
    alertRenewalDays: z.string({
        required_error: "Alert renewal days is required",
    }),
    purchasePrice: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Purchase price is required"
    }),
    vendor: z.string().min(1, "Vendor is required"),
    licenseKey: z.string().min(1, "Product key is required"),
    notes: z.string().optional()

})
    .refine((data) => data.licenseCopiesCount > data.minCopiesAlert, {
        message: "Min. Copies must be greater than or equal to license copies count",
        path: ["minCopiesAlert"],
    })
    .refine((data) =>data.purchaseDate <=  data.renewalDate , {
        message: "Renewal date must in the future",
        path: ["renewalDate"],
    })


export const categorySchema = z.object({
    name: z
        .string()
        .min(3, {message: 'Name must be at least 3 characters'})
        .max(50, {message: 'Name must not be more than 50 characters'})
});

export const loginSchema =  z.object({
    email: z.string().email("Invalid email"),
    password: z.string()
        .min(8, {message: "Password must be at least 8 characters long"})
        .max(20, {message: "Password must not exceed 20 characters"}),
});


export  const registerSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string()
        .min(8, {message: "Password must be at least 8 characters long"})
        .max(20, {message: "Password must not exceed 20 characters"}),
    repeatPassword: z.string().min(1, "Password is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().min(1, "Phone number is required"),
    companyName: z.string().min(1, "Company name is required"),

});

export const statusLabelSchema = z.object({
    name: z
        .string()
        .min(3, {message: 'Name must be at least 3 characters'})
        .max(50, {message: 'Name must not be more than 50 characters'}),
    description: z.string().min(1, "Description is required"),
    colorCode: z.string().optional(),
    isArchived: z.boolean().optional(),
    allowLoan: z.boolean().optional(),
});


export  const personSchema = z.object({

    id: z.string().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    roleId: z.string().min(1, "Role is required"),
    companyId: z.number().optional(),
    title: z.string().min(1, "Title is required"),
    employeeId: z.string().min(1, "Employee Id is required"),
})