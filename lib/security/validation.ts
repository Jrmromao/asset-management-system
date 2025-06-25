import { z } from "zod";
import { NextRequest } from "next/server";

// Common validation schemas
export const commonSchemas = {
  id: z.string().uuid("Invalid ID format"),
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  url: z.string().url("Invalid URL format").optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]{10,}$/, "Invalid phone number")
    .optional(),
  currency: z.string().length(3, "Currency must be 3 characters"),
  amount: z.number().min(0, "Amount must be positive"),
  date: z.string().datetime("Invalid date format").or(z.date()),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
  }),
};

// Sanitization functions
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
}

// Request validation wrapper
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  options: {
    sanitize?: boolean;
    source?: "body" | "query" | "params";
  } = {},
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    let data: any;

    switch (options.source) {
      case "query":
        data = Object.fromEntries(request.nextUrl.searchParams.entries());
        break;
      case "params":
        // For params, you'd typically pass them separately
        throw new Error("Params validation requires separate handling");
      case "body":
      default:
        const body = await request.text();
        if (!body) {
          return { success: false, error: "Request body is required" };
        }
        data = JSON.parse(body);
        break;
    }

    // Sanitize strings if requested
    if (options.sanitize) {
      data = sanitizeObject(data);
    }

    // Validate with schema
    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: `Validation failed: ${errors}` };
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: "Invalid JSON format" };
    }
    return { success: false, error: "Validation error occurred" };
  }
}

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

// SQL injection prevention
export function escapeSqlIdentifier(identifier: string): string {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "");
}

// XSS prevention for display
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// CSRF token validation (for forms)
export function validateCsrfToken(
  token: string,
  sessionToken: string,
): boolean {
  // Simple CSRF validation - in production, use a more robust implementation
  return token === sessionToken && token.length > 20;
}

// File upload validation
export const fileValidation = {
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/csv",
  ],
  maxSize: 10 * 1024 * 1024, // 10MB

  validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.allowedTypes.includes(file.type)) {
      return { valid: false, error: "File type not allowed" };
    }

    if (file.size > this.maxSize) {
      return { valid: false, error: "File size too large" };
    }

    return { valid: true };
  },
};

// Asset-specific validation schemas
export const assetSchemas = {
  create: z.object({
    name: commonSchemas.name,
    description: commonSchemas.description,
    categoryId: commonSchemas.id.optional(),
    statusLabelId: commonSchemas.id.optional(),
    locationId: commonSchemas.id.optional(),
    departmentId: commonSchemas.id.optional(),
    supplierId: commonSchemas.id.optional(),
    modelNumber: z.string().max(100).optional(),
    serialNumber: z.string().max(100).optional(),
    purchaseDate: commonSchemas.date.optional(),
    purchasePrice: commonSchemas.amount.optional(),
    currency: commonSchemas.currency.optional(),
    warrantyMonths: z.number().min(0).max(120).optional(),
    notes: z.string().max(2000).optional(),
  }),

  update: z.object({
    id: commonSchemas.id,
    name: commonSchemas.name.optional(),
    description: commonSchemas.description,
    categoryId: commonSchemas.id.optional(),
    statusLabelId: commonSchemas.id.optional(),
    locationId: commonSchemas.id.optional(),
    departmentId: commonSchemas.id.optional(),
    supplierId: commonSchemas.id.optional(),
    modelNumber: z.string().max(100).optional(),
    serialNumber: z.string().max(100).optional(),
    purchaseDate: commonSchemas.date.optional(),
    purchasePrice: commonSchemas.amount.optional(),
    currency: commonSchemas.currency.optional(),
    warrantyMonths: z.number().min(0).max(120).optional(),
    notes: z.string().max(2000).optional(),
  }),
};

// License-specific validation schemas
export const licenseSchemas = {
  create: z.object({
    name: commonSchemas.name,
    description: commonSchemas.description,
    categoryId: commonSchemas.id.optional(),
    supplierId: commonSchemas.id.optional(),
    licenseKey: z.string().min(1, "License key is required").max(500),
    seats: z.number().min(1, "Seats must be at least 1"),
    purchaseDate: commonSchemas.date.optional(),
    expirationDate: commonSchemas.date.optional(),
    cost: commonSchemas.amount.optional(),
    currency: commonSchemas.currency.optional(),
    notes: z.string().max(2000).optional(),
  }),
};

// User validation schemas
export const userSchemas = {
  create: z.object({
    email: commonSchemas.email,
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    roleId: commonSchemas.id,
    departmentId: commonSchemas.id.optional(),
    employeeId: z.string().max(50).optional(),
    title: z.string().max(100).optional(),
  }),

  update: z.object({
    id: commonSchemas.id,
    firstName: commonSchemas.name.optional(),
    lastName: commonSchemas.name.optional(),
    roleId: commonSchemas.id.optional(),
    departmentId: commonSchemas.id.optional(),
    employeeId: z.string().max(50).optional(),
    title: z.string().max(100).optional(),
  }),
};
