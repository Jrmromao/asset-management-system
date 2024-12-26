import { z } from "zod";
import { fetchApi } from "@/utils/api";

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

const   emailField = (entity: string) => z.string()
    .min(1, "Email is required")
    .email("Valid email is required").optional()
        // .refine(
        //     async (email) => validateUnique('email', email, 'email', entity),
        //     "Email already exists"
        // )

const phoneNumField =  z.string()
        .min(1, "Phone number is required").optional()
    // .refine(
    //     async (phoneNum) => validateUnique('phoneNum', phoneNum, 'phoneNum'),
    //     "Phone number already exists"
    // )


export const validateUnique = async (
    field: string,
    value: string,
    endpoint: string,
    entity?: string
): Promise<boolean> => {
    try {
        const url = entity ? `api/validate/${endpoint}?entity=${entity}` : `api/validate/${endpoint}`;

        console.log(url)
        const res = await fetchApi(url, {
            method: 'POST',
            body: JSON.stringify({ [field]: value })
        });

        if (!res.ok) {
            throw new Error(`Failed to validate ${field}`);
        }

        const exists = await res.json();
        return !exists;
    } catch (error) {
        console.error(`${field} validation error:`, error);
        throw error;
    }
};



const dateField = (fieldName: string) => z.date({
    required_error: `${fieldName} is required`
}).optional();

const passwordSchema = z.string().refine(
    (value) => /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/.test(value),
    {
        message: "Password must contain at least one number, one special character, one uppercase letter, one lowercase letter, and be at least 8 characters long.",
    }
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

export const registerSchema = z.object({
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email format")
        .refine(
            async (email) => {
                try {
                    const response = await fetch('http://localhost:3000/api/validate/email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email }),
                    });

                    if (!response.ok) {
                        throw new Error('Validation request failed');
                    }

                    const data = await response.json();
                    // Return true if email doesn't exist (available for registration)
                    return !data.exists;
                } catch (error) {
                    console.error('Email validation error:', error);
                    throw new Error('Email validation failed');
                }
            },
            "Email already exists"
        ),
    password: passwordSchema,
    repeatPassword: z.string().min(1, "Password is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: phoneNumField,
    companyName: z.string()
        .min(1, "Company name is required")
        .refine(
            async (company) => {
                try {
                    const response = await fetch('http://localhost:3000/api/validate/company', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ company }),
                    });

                    if (!response.ok) {
                        throw new Error('Validation request failed');
                    }

                    const data = await response.json();
                    // Return true if company doesn't exist (available for registration)
                    return !data.exists;
                } catch (error) {
                    console.error('Company validation error:', error);
                    throw new Error('Company validation failed');
                }
            },
            "Company name already exists"
        )
}).refine((data) => data.password === data.repeatPassword, {
    message: "Passwords do not match",
    path: ["repeatPassword"],
});

// Merged and refined schemas
// export const accessorySchema_ = z.object({
//     title: requiredString("Accessory Title is required"),
//     totalQuantityCount: z.number({ required_error: "Quantity count is required" })
//         .transform((value) => Number(value))
//         .refine((value) => value >= 1, { message: "Quantity count must be at least 1" }),
//     minQuantityAlert: z.number({ required_error: "Min. quantity is required" })
//         .transform((value) => Number(value))
//         .refine((value) => value >= 1, { message: "Min. quantity must be at least 1" }),
//     alertEmail: emailField('accessory'),
//     categoryId: z.string().optional(),
//     endOfLife: dateField('End of Life'),
//     companyId: z.string().optional(),
//     material: z.string().optional(),
//     poNumber: z.string().optional(),
//     price: z.number().optional(),
//     vendor: requiredString("Vendor is required"),
//
//     purchaseDate: dateField("Purchase date"),
//     description: z.string().optional()
// }).refine((data) => data.minQuantityAlert <= data.totalQuantityCount, {
//     message: "Min. quantity must be less than or equal to quantity count.",
//     path: ["minQuantityAlert"],
// });


export const licenseSchema = z.object({
    licenseName: z.string().min(1, "License name is required"),
    licenseCopiesCount: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "License copies count is required"
    }),
    minCopiesAlert: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Min. copies alert is required"
    }),
    licensedEmail: z.string().email("Valid email is required"),
    purchaseDate: z.date(),
    renewalDate: z.date(),
    statusLabelId: z.string().min(1, "Status is required"),
    alertRenewalDays: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Alert renewal days is required"
    }),
    purchasePrice: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
        message: "Purchase price is required"
    }),
    poNumber: z.string().min(1, "PO number is required"),
    licenseKey: z.string().optional(),
    notes: z.string().optional(),
    departmentId: z.string().min(1, "Department is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    locationId: z.string().min(1, "Location is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    attachments: z.array(z.any()).optional()
}).refine((data) => data.licenseCopiesCount < data.minCopiesAlert, {
    message: "Min. Copies must be greater than or equal to license copies count",
    path: ["minCopiesAlert"],
}).refine((data) => data.purchaseDate <= data.renewalDate, {
    message: "Renewal date must in the future",
    path: ["renewalDate"],
});


export const accessorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    supplierId: z.string().min(1, "Supplier is required"),
    locationId: z.string().min(1, "Location is required"),
    modelId: z.string().min(1, "Model is required"),
    inventoryId: z.string().min(1, "Inventory is required"),
    departmentId: z.string().min(1, "Department is required"),
    price: z.union([z.string(), z.number()]).transform(value =>
        typeof value === 'string' ? Number(value) : value
    ).optional(),
    totalQuantityCount: z.union([z.string(), z.number()]).transform(value =>
        typeof value === 'string' ? Number(value) : value
    ),
    reorderPoint: z.union([z.string(), z.number()]).transform(value =>
        typeof value === 'string' ? Number(value) : value
    ),
    poNumber: z.string().optional(),
    purchaseDate: z.date(),
    endOfLife: z.date(),
    alertEmail: z.string().email("Invalid email"),
    material: z.string().optional(),
    weight: z.union([z.string(), z.number()]).transform(value =>
        typeof value === 'string' ? Number(value) : value
    ).optional(),
    statusLabelId: z.string().optional(),
    notes: z.string().optional(),
})
    .refine((data) => data.reorderPoint <= data.totalQuantityCount, {
        message: "Reorder point must be less than or equal to quantity count.",
        path: ["reorderPoint"],
    });

export const categorySchema = z.object({
    ...nameField('Category')
});

export const loginSchema = z.object({
    email: z.string().min(1, "Email is required").email("Valid email is required"),
    password: z.string({ required_error: "Password is required" })
            .min(1, { message: "Password is required" })
});

export const accountVerificationSchema = z.object({
    email: z.string().min(1, "Email is required").email("Valid email is required"),
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
    email: z.string().min(1, "Email is required").email("Valid email is required"),
});


// const checkCompanyName = async (companyName: string): Promise<boolean> => {
//     try {
//         const res = await fetch('/api/validate/company', { // Updated URL
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ companyName })
//         });
//
//         if (!res.ok) {
//             const error = await res.json();
//             throw new Error(error.message || 'Failed to validate company name');
//         }
//
//         const data = await res.json();
//         return data.exists; // Assuming your API returns { exists: boolean }
//     } catch (error) {
//         console.error('Company validation error:', error);
//         // Re-throw with user-friendly message
//         throw new Error('Unable to check company name availability. Please try again.');
//     }
// };
//
// export const registerSchema = z.object({
//     email: emailField('user'),
//     password: passwordSchema,
//     repeatPassword: z.string().min(1, "Password is required"),
//     firstName: z.string().min(1, "First name is required"),
//     lastName: z.string().min(1, "Last name is required"),
//     phoneNumber: z.string().min(1, "Phone number is required"),
//     companyName:  z.string().min(2, "Company name must be at least 2 characters")
//         .max(100, "Company name must be less than 100 characters")
//         .transform(name => name.trim())
//         .refine(
//             async (companyName) => {
//                 try {
//                     const exists = await checkCompanyName(companyName);
//                     return !exists;
//                 } catch (error) {
//                     throw new Error('Company name validation failed');
//                 }
//             },
//             "Company name already exists"
//         ),
// }).refine((data) => data.password === data.repeatPassword, {
//     message: "Passwords do not match",
//     path: ["repeatPassword"],
// });



// Helper function for company name validation
const checkCompanyName = async (companyName: string): Promise<boolean> => {
    try {
        // Use the correct URL - absolute path from the root
        const res = await fetch('/api/validate/company', {  // Changed URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ companyName })
        });

        if (!res.ok) {
            throw new Error('Failed to validate company name');
        }

        const data = await res.json();
        return data.exists;
    } catch (error) {
        console.error('Company validation error:', error);
        throw new Error('Unable to validate company name');
    }
};



export const statusLabelSchema = z.object({
    ...nameField('Status Label'),
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
    itemID: z.string().optional()
});


export const assignmentSchema = z.object({
    userId: z.string().min(1, "User is required"),
    itemId: z.string().min(1, "Item ID is required"),
    type: z.enum(['asset', 'license', 'accessory', 'consumable'])
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
    email: emailField('supplier'),
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
    email: z.string()
        .min(1, "Email is required")
        .email("Invalid email format")
        .refine(
            async (email) => {
                try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/email`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email }),
                    });

                    if (!response.ok) {
                        throw new Error('Validation request failed');
                    }

                    const data = await response.json();
                    // Return true if email doesn't exist (available for registration)
                    return !data.exists;
                } catch (error) {
                    console.error('Email validation error:', error);
                    throw new Error('Email validation failed');
                }
            },
            "Email already exists"
        ),
    phoneNum: z.string().min(1, "Phone number is required"),
    title: z.string().min(1, "Title is required"),
    employeeId: z.string()
        .min(1, "Employee ID is required")
        .refine(async (employeeId) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/employeeId`, {
                method: 'POST',
                body: JSON.stringify({ employeeId })
            });
            const exists = await res.json();
            return !exists;
        }, "Employee ID already exists"),
    roleId: z.string().min(1, "Role is required"),
});




// export const userSchema = z.object({
//     email: z.string()
//         .email()
//         .refine(async (email) => {
//             try {
//                 const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/email`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ email }),
//                 });
//                 const result = await response.json();
//                 return result.available;
//             } catch (error) {
//                 console.error('Email validation error:', error);
//                 return false;
//             }
//         }, { message: 'Email already exists' }),
//
//     employeeId: z.string()
//         .refine(async (employeeId) => {
//             try {
//                 const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/validate/employeeId`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ employeeId }),
//                 });
//                 const result = await response.json();
//                 return result.available;
//             } catch (error) {
//                 console.error('Employee ID validation error:', error);
//                 return false;
//             }
//         }, { message: 'Employee ID already exists' }),
//
//     firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
//     lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
//     title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
//     roleId: z.string().uuid({ message: 'Invalid role ID' }),
//     password: z.string().optional(),
// });


const customFieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['text', 'number', 'date', 'select', 'checkbox']),
    value: z.union([
        z.string(),
        z.number(),
        z.date(),
        z.boolean()
    ]).optional(),
    options: z.array(z.string()).optional()
});
export const assetSchema = z.object({
    name: z.string().min(1, "Asset name is required"),
    purchaseDate: z.date({
        message: "Purchase Date is required."
    }),
    serialNumber: z.string().min(1, "Serial number is required"),
    modelId: z.string().min(1, "Model is required").optional(),
    statusLabelId: z.string().min(1, "Status is required").optional(),
    departmentId: z.string().min(1, "Department is required").optional(),
    inventoryId: z.string().min(1, "Inventory is required").optional(),
    locationId: z.string().min(1, "Location is required").optional(),
    supplierId: z.string().min(1, "Supplier is required").optional(),
    price: z.union([
        z.string()
            .min(1, "Price is required")
            .transform((val) => {
                const parsed = parseFloat(val);
                if (isNaN(parsed)) throw new Error("Invalid price");
                return parsed;
            }),
        z.number()
    ]),
    weight: z.union([
        z.string()
            .transform((val) => {
                if (!val) return undefined;
                const parsed = parseFloat(val);
                if (isNaN(parsed)) throw new Error("Invalid weight");
                return parsed;
            }),
        z.number().optional()
    ]),
    poNumber: z.string().min(1, 'PO Number is required').optional(),
    material: z.string().optional(),
    formTemplateId: z.string().optional(),
    templateValues: z.record(z.any()).optional(),
    energyRating: z.string().optional(),
    licenseId: z.string().optional(),
    dailyOperatingHours: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
    // message: "Daily operating hours must be a number",
}).optional(),
    customFields: z.array(customFieldSchema).optional(),
    endOfLife: dateField('End of Life')
});