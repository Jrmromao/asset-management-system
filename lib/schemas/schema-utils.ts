import { z } from "zod";

export const isRequiredField = (field: unknown): field is z.ZodTypeAny => {
  if (!(field instanceof z.ZodType)) return false;

  // Check if it's explicitly optional
  if (field instanceof z.ZodOptional) return false;

  // Check if it's a string with min validation
  if (field instanceof z.ZodString) {
    const checks = field._def.checks || [];
    return checks.some((check) => check.kind === "min" && check.value > 0);
  }

  // Handle other required types
  return true;
};

const getSchemaShape = (schema: z.ZodTypeAny) => {
  if (schema instanceof z.ZodObject) {
    return schema._def.shape();
  }

  if (schema instanceof z.ZodEffects) {
    const innerSchema = schema._def.schema;
    return innerSchema instanceof z.ZodObject ? innerSchema._def.shape() : {};
  }

  return {};
};

export const getRequiredFieldCount = (schema: z.ZodTypeAny): number => {
  const shape = getSchemaShape(schema);
  return Object.values(shape).filter((field): field is z.ZodTypeAny =>
    isRequiredField(field),
  ).length;
};

export const getRequiredFieldsList = (schema: z.ZodTypeAny): string[] => {
  const shape = getSchemaShape(schema);
  return Object.entries(shape)
    .filter(([_, field]) => isRequiredField(field))
    .map(([key]) => key);
};

// Common field creators
export const requiredString = (message: string) =>
  z.string({ required_error: message });

export const nameField = (name: string) => ({
  name: requiredString(`${name} name is required`),
});

export const addressFields = {
  addressLine1: requiredString("Address line 1 is required"),
  addressLine2: z.string().optional(),
  state: requiredString("State is required"),
  city: requiredString("City is required"),
  zip: requiredString("Zipcode is required"),
  country: requiredString("Country is required"),
};

export const emailField = () =>
  z
    .string()
    .min(1, "Email is required")
    .email("Valid email is required")
    .optional();

export const phoneNumField = z
  .string()
  .min(1, "Phone number is required")
  .optional();

export const dateField = (fieldName: string) =>
  z
    .date({
      required_error: `${fieldName} is required`,
    })
    .optional();

export const passwordSchema = z
  .string()
  .refine(
    (value) =>
      /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z]).{8,}$/.test(value),
    {
      message:
        "Password must contain at least one number, one special character, one uppercase letter, one lowercase letter, and be at least 8 characters long.",
    },
  );

type ValidationOptions = {
  path: string;
};

// export async function validateUniqueField({ path }: { path: string }) {
//   const response = await fetch(path);
//   const data = await response.json();
//   return !data.exists; // We should return true if the field is unique (doesn't exist)
// }

export async function validateUniqueField({ path }: { path: string }) {
  try {
    // This works in both client and server environments
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || // Custom environment variable
      (typeof window !== "undefined" ? window.location.origin : ""); // Fallback

    // Ensure we have a base URL
    if (!baseUrl) {
      console.error("No base URL available for validation");
      return false;
    }

    const fullUrl = `${baseUrl}${path}`;

    const response = await fetch(fullUrl);
    const data = await response.json();
    return !data.exists;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}
