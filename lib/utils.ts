import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { SignJWT } from "jose";
import { Battery, BatteryFull, BatteryLow, BatteryMedium } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundFloat(value: number, precision: number) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

export function processRecordContents(csvContent: string) {
  const rows = csvContent.split("\n");

  // Get and clean headers
  const headers = rows[0].split(",").map((header) => header.trim());

  // Process data rows
  const data = rows
    .slice(1)
    .filter((row) => row.trim()) // Skip empty rows
    .map((row) => {
      const values = row.split(",").map((value) => value.trim());
      const rowData: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });
      return rowData;
    });
  return data;
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
    dateTimeOptions,
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions,
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
    currency: "EUR",
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

export const sleep = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );
}

export function hideEmailAddress(email: string): string | null {
  if (!email || email.split("@").length !== 2) {
    return null; // Or return an error message if needed
  }

  const [username, domain] = email.split("@");
  const lettersToHide = Math.floor(username.length * 0.8);
  const hiddenUsername =
    username.slice(0, -lettersToHide) + "*".repeat(lettersToHide);

  return hiddenUsername + "@" + domain;
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

export const validateEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const formSchema = () =>
  z.object({
    id: z.string().optional(),
    assetName: z.string().min(1, "Asset name is required"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    serialNumber: z.string().min(1, "Serial number is required"),
    category: z.string().min(1, "Category is required"),
    purchasePrice: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a number")
      .min(1, "Amount is too short"),
    newLicenseName: z.string().optional(),
    existingLicenseName: z.string().optional(),
    key: z.string().min(1, "Key is required"),
    issuedDate: z.string().min(1, "Issued date is required"),
    expirationDate: z.string().min(1, "Expiration date is required"),
  });

export function filterColumns<T>(
  data: T[],
  columnsToExclude: (keyof T)[],
): Partial<T>[] {
  return data?.map((item) => {
    const filteredItem: Partial<T> = {};
    for (const key in item) {
      if (!columnsToExclude.includes(key as keyof T)) {
        filteredItem[key] = item[key];
      }
    }
    return filteredItem;
  });
}

export function renameColumns<T>(
  data: T[],
  columnMappings: Record<keyof T, string>,
): any[] {
  return data?.map((item) => {
    const renamedItem: any = {};
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

export const getCO2ScoreInfo = (scoreInKg: number) => {
  const scoreInTonnes = scoreInKg / 1000;

  const formatDescription = (kg: number) => {
    if (kg < 1000) {
      return `${kg} kg`;
    }
    return `${kg / 1000} tonnes`;
  };

  if (scoreInTonnes <= 1) {
    // 0-1 tonne (0-1000 kg)
    return {
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      icon: BatteryFull,
      label: "Excellent",
      description: `Very low carbon footprint (${formatDescription(scoreInKg)} CO2e)`,
    };
  }
  if (scoreInTonnes <= 5) {
    // 1-5 tonnes (1000-5000 kg)
    return {
      color: "text-green-700",
      bgColor: "bg-green-50",
      icon: BatteryMedium,
      label: "Good",
      description: `Low carbon footprint (${formatDescription(scoreInKg)} CO2e)`,
    };
  }
  if (scoreInTonnes <= 10) {
    // 5-10 tonnes (5000-10000 kg)
    return {
      color: "text-yellow-700",
      bgColor: "bg-yellow-50",
      icon: BatteryLow,
      label: "Fair",
      description: `Moderate carbon footprint (${formatDescription(scoreInKg)} CO2e)`,
    };
  }
  return {
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: Battery,
    label: "High",
    description: `High carbon footprint (${formatDescription(scoreInKg)} CO2e)`,
  };
};

/**
 * Returns color and label configuration for asset availability status
 * @param value - The availability status string
 * @returns Object containing color scheme and label for the status
 */
export const getAvailability = (value: string = "") => {
  // Add debug logging to see exact input

  if (!value)
    return {
      color: "text-gray-700",
      bgColor: "bg-gray-100",
      label: "Unknown",
    };

  // Explicitly handle "On Loan" status
  if (value === "On Loan") {
    return {
      color: "text-yellow-700",
      bgColor: "bg-yellow-100",
      label: "On Loan",
    };
  }

  if (value === "Available") {
    return {
      color: "text-emerald-700",
      bgColor: "bg-emerald-100",
      label: "Available",
    };
  }

  // Default case
  return {
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    label: value,
  };
};

export function sumSeatsAssigned(assignments: UserItems[]): number {
  return assignments.reduce((sum, assignment) => sum + assignment.quantity, 0);
}

export function sumUnitsAssigned(assignments: UserItems[]): number {
  return assignments.reduce((sum, item) => sum + item.quantity, 0);
}

// function sumQuantities(assignments: UserAccessory[]): number {
//   return assignments.reduce((sum, item) => sum + item.quantity, 0);
// }
