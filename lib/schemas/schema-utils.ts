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
  field: string;
  value: string;
  basePath: string;
};

export const validateUniqueField = async ({
  field,
  value,
  basePath,
}: ValidationOptions) => {
  try {
    const response = await fetch(`${basePath}/api/validate/${field}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = await response.json();
    return !data.exists;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
  }
};
