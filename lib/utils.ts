/* eslint-disable no-prototype-builtins */
import {type ClassValue, clsx} from "clsx";
import qs from "query-string";
import {twMerge} from "tailwind-merge";
import {z} from "zod";
import {SignJWT} from "jose";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
    const dateTimeOptions: Intl.DateTimeFormatOptions = {
        weekday: "short", // abbreviated weekday name (e.g., 'Mon')
        month: "short", // abbreviated month name (e.g., 'Oct')
        day: "numeric", // numeric day of the month (e.g., '25')
        hour: "numeric", // numeric hour (e.g., '8')
        minute: "numeric", // numeric minute (e.g., '30')
        hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };

    const dateDayOptions: Intl.DateTimeFormatOptions = {
        weekday: "short", // abbreviated weekday name (e.g., 'Mon')
        year: "numeric", // numeric year (e.g., '2023')
        month: "2-digit", // abbreviated month name (e.g., 'Oct')
        day: "2-digit", // numeric day of the month (e.g., '25')
    };

    const dateOptions: Intl.DateTimeFormatOptions = {
        month: "short", // abbreviated month name (e.g., 'Oct')
        year: "numeric", // numeric year (e.g., '2023')
        day: "numeric", // numeric day of the month (e.g., '25')
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric", // numeric hour (e.g., '8')
        minute: "numeric", // numeric minute (e.g., '30')
        hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
    };

    const formattedDateTime: string = new Date(dateString).toLocaleString(
        "en-US",
        dateTimeOptions
    );

    const formattedDateDay: string = new Date(dateString).toLocaleString(
        "en-US",
        dateDayOptions
    );

    const formattedDate: string = new Date(dateString).toLocaleString(
        "en-US",
        dateOptions
    );

    const formattedTime: string = new Date(dateString).toLocaleString(
        "en-US",
        timeOptions
    );

    return {
        dateTime: formattedDateTime,
        dateDay: formattedDateDay,
        dateOnly: formattedDate,
        timeOnly: formattedTime,
    };
};

export function formatAmount(amount: number): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
    });

    return formatter.format(amount);
}

export const parseStringify = (value: any) => JSON.parse(JSON.stringify(value));

export const removeSpecialCharacters = (value: string) => {
    return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
    params: string;
    key: string;
    value: string;
}

export function formUrlQuery({params, key, value}: UrlQueryParams) {
    const currentUrl = qs.parse(params);

    currentUrl[key] = value;

    return qs.stringifyUrl(
        {
            url: window.location.pathname,
            query: currentUrl,
        },
        {skipNull: true}
    );
}
//
// export function getAccountTypeColors(type: AccountTypes) {
//     switch (type) {
//         case "depository":
//             return {
//                 bg: "bg-blue-25",
//                 lightBg: "bg-blue-100",
//                 title: "text-blue-900",
//                 subText: "text-blue-700",
//             };
//
//         case "credit":
//             return {
//                 bg: "bg-success-25",
//                 lightBg: "bg-success-100",
//                 title: "text-success-900",
//                 subText: "text-success-700",
//             };
//
//         default:
//             return {
//                 bg: "bg-green-25",
//                 lightBg: "bg-green-100",
//                 title: "text-green-900",
//                 subText: "text-green-700",
//             };
//     }
// }

// export function countTransactionCategories(
//     transactions: Transaction[]
// ): CategoryCount[] {
//     const categoryCounts: { [category: string]: number } = {};
//     let totalCount = 0;
//
//     // Iterate over each transaction
//     transactions &&
//     transactions.forEach((transaction) => {
//         // Extract the category from the transaction
//         const category = transaction.category;
//
//         // If the category exists in the categoryCounts object, increment its count
//         if (categoryCounts.hasOwnProperty(category)) {
//             categoryCounts[category]++;
//         } else {
//             // Otherwise, initialize the count to 1
//             categoryCounts[category] = 1;
//         }
//
//         // Increment total count
//         totalCount++;
//     });
//
//     // Convert the categoryCounts object to an array of objects
//     const aggregatedCategories: CategoryCount[] = Object.keys(categoryCounts).map(
//         (category) => ({
//             name: category,
//             count: categoryCounts[category],
//             totalCount,
//         })
//     );
//
//     // Sort the aggregatedCategories array by count in descending order
//     aggregatedCategories.sort((a, b) => b.count - a.count);
//
//     return aggregatedCategories;
// }

// export function extractCustomerIdFromUrl(url: string) {
//     // Split the URL string by '/'
//     const parts = url.split("/");
//
//     // Extract the last part, which represents the customer ID
//     const customerId = parts[parts.length - 1];
//
//     return customerId;
// }

export function encryptId(id: string) {
    return btoa(id);
}

export function decryptId(id: string) {
    return atob(id);
}

export const getTransactionStatus = (date: Date) => {
    const today = new Date();
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    return date > twoDaysAgo ? "Processing" : "Success";
};


const asset = ['asset']
const common = ['asset', 'category', 'license']
const categoryLicense = ['asset', 'category', 'license']
const license = [ 'license']
const signupSignin = ['sign-in', 'sign-up']
const signup = ['sign-un']


const passwordSchema = z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must not exceed 20 characters" })
    // .refine(
    //     (value) =>
    //         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(value),
    //     {
    //         message:
    //             "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
    //     }
    // );




export const formSchema = (type: string, licenseType: string = 'no') => z.object({
    // password: passwordSchema,
    // common
    name: z.string().min(1, "Name is required"),
    id: z.string().optional(),
    purchaseNotes: z.string().optional(),
    //asset
    assetName: type === 'asset' ? z.string().min(1, "Asset name is required") : z.string().optional(),
    brand: type === 'asset' ? z.string().min(1, "Brand is required") : z.string().optional(),
    model:  type === 'asset' ? z.string().min(1, "Model is required") : z.string().optional(),
    serialNumber: type === 'asset' ? z.string().min(1, "Serial number is required") : z.string().optional(),
    category:   type === 'asset' ? z.string().min(1, "Category is required") : z.string().optional(),
    purchasePrice: type === 'asset' ? z .string()
        .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a number")
        .min(1, "Amount is too short") : z.string().optional(),

    newLicenseName:  z.string().optional(),
    existingLicenseName:  z.string().optional(),


    key:  z.string().optional(),
    issuedDate:  z.string().optional(),
    expirationDate:  z.string().optional(),
    // //
    // // sign-up & sign-in
    // email: type === 'sign-up' ? z.string().email("Invalid email").min(1, "Email is required") : z.string().optional(),
    // password: type === 'sign-up'  ?  passwordSchema : z.string().optional(),
    //
    // // // signup - register
    // repeatPassword: type === 'sign-up'  ? z.string().min(1, "Password is required") : z.string().optional(),
    // firstName: type === 'sign-up' ? z.string().min(1, "First name is required") : z.string().optional(),
    // lastName: type === 'sign-up' ? z.string().min(1, "Last name is required") : z.string().optional(),
    // phoneNumber: type === 'sign-up' ? z.string().min(1, "Phone number is required") : z.string().optional(),
    // companyName: type === 'sign-up' ? z.string().min(1, "Company name is required") : z.string().optional(),
})

export function filterColumns<T>(data: T[], columnsToExclude: (keyof T)[]): Partial<T>[] {
    return data?.map(item => {
        const filteredItem: Partial<T> = {};
        for (const key in item) {
            if (!columnsToExclude.includes(key as keyof T)) {
                filteredItem[key] = item[key];
            }
        }
        return filteredItem;
    });
}

export function renameColumns<T>(data: T[], columnMappings: Record<keyof T, string>): any[] {
    return data?.map(item => {
        const renamedItem: any = {}; // Using 'any' for flexibility
        for (const key in item) {
            const newKey = columnMappings[key] || key; // Rename if mapping exists
            renamedItem[newKey] = item[key];
        }
        return renamedItem;
    });
}

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10 sec from now")
        .sign(key);
}
