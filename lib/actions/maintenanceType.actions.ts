"use server";

import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { handleError, parseStringify } from "@/lib/utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

// Types for maintenance types and categories
export interface MaintenanceType {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  estimatedDuration: number; // in hours
  requiredSkills: string[];
  defaultCost: number;
  isActive: boolean;
  color: string;
  icon: string;
  checklist: ChecklistItem[];
  customFields: CustomField[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  order: number;
}

export interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "boolean" | "select" | "date";
  isRequired: boolean;
  options?: string[];
  defaultValue?: any;
  order: number;
}

// Validation schemas
const maintenanceTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  estimatedDuration: z.number().min(0).default(1),
  requiredSkills: z.array(z.string()).default([]),
  defaultCost: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  color: z.string().default("#3B82F6"),
  icon: z.string().default("wrench"),
  checklist: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        isRequired: z.boolean(),
        order: z.number(),
      }),
    )
    .default([]),
  customFields: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["text", "number", "boolean", "select", "date"]),
        isRequired: z.boolean(),
        options: z.array(z.string()).optional(),
        defaultValue: z.any().optional(),
        order: z.number(),
      }),
    )
    .default([]),
});

const maintenanceCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string().default("#3B82F6"),
  isActive: z.boolean().default(true),
});

export type CreateMaintenanceTypeParams = z.infer<typeof maintenanceTypeSchema>;
export type CreateMaintenanceCategoryParams = z.infer<
  typeof maintenanceCategorySchema
>;

// MAINTENANCE CATEGORIES

// Get all maintenance categories for a company
export const getMaintenanceCategories = withAuth(
  async (user): Promise<AuthResponse<MaintenanceCategory[]>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: [],
        };
      }

      const categories = await prisma.maintenanceCategory.findMany({
        where: { companyId },
        orderBy: { name: "asc" },
      });

      return { success: true, data: parseStringify(categories) };
    } catch (error) {
      return handleError(error, []);
    }
  },
);

// Create a new maintenance category
export const createMaintenanceCategory = withAuth(
  async (
    user,
    data: CreateMaintenanceCategoryParams,
  ): Promise<AuthResponse<MaintenanceCategory>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceCategory,
        };
      }

      const validation = maintenanceCategorySchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid data",
          data: {} as MaintenanceCategory,
        };
      }

      // Check if category name already exists for this company
      const existingCategory = await prisma.maintenanceCategory.findFirst({
        where: {
          name: validation.data.name,
          companyId,
        },
      });

      if (existingCategory) {
        return {
          success: false,
          error: "A category with this name already exists",
          data: {} as MaintenanceCategory,
        };
      }

      const category = await prisma.maintenanceCategory.create({
        data: {
          ...validation.data,
          companyId,
        },
      });

      revalidatePath("/maintenance-flows");
      await createAuditLog({
        companyId,
        action: "MAINTENANCE_CATEGORY_CREATED",
        entity: "MAINTENANCE_CATEGORY",
        entityId: category.id,
        details: `Maintenance category created: ${category.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(category) };
    } catch (error) {
      return handleError(error, {} as MaintenanceCategory);
    }
  },
);

// Update a maintenance category
export const updateMaintenanceCategory = withAuth(
  async (
    user,
    id: string,
    data: CreateMaintenanceCategoryParams,
  ): Promise<AuthResponse<MaintenanceCategory>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceCategory,
        };
      }

      const validation = maintenanceCategorySchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid data",
          data: {} as MaintenanceCategory,
        };
      }

      // Check if category exists and belongs to company
      const existingCategory = await prisma.maintenanceCategory.findFirst({
        where: { id, companyId },
      });

      if (!existingCategory) {
        return {
          success: false,
          error: "Category not found",
          data: {} as MaintenanceCategory,
        };
      }

      // Check if name is unique (excluding current category)
      const duplicateCategory = await prisma.maintenanceCategory.findFirst({
        where: {
          name: validation.data.name,
          companyId,
          id: { not: id },
        },
      });

      if (duplicateCategory) {
        return {
          success: false,
          error: "A category with this name already exists",
          data: {} as MaintenanceCategory,
        };
      }

      const category = await prisma.maintenanceCategory.update({
        where: { id },
        data: validation.data,
      });

      revalidatePath("/maintenance-flows");
      await createAuditLog({
        companyId,
        action: "MAINTENANCE_CATEGORY_UPDATED",
        entity: "MAINTENANCE_CATEGORY",
        entityId: id,
        details: `Maintenance category updated: ${category.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(category) };
    } catch (error) {
      return handleError(error, {} as MaintenanceCategory);
    }
  },
);

// Delete a maintenance category
export const deleteMaintenanceCategory = withAuth(
  async (user, id: string): Promise<AuthResponse<boolean>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: false,
        };
      }

      // Check if category exists and belongs to company
      const existingCategory = await prisma.maintenanceCategory.findFirst({
        where: { id, companyId },
      });

      if (!existingCategory) {
        return {
          success: false,
          error: "Category not found",
          data: false,
        };
      }

      // Check if category is being used by maintenance types
      const maintenanceTypesCount = await prisma.maintenanceType.count({
        where: { categoryId: existingCategory.id, companyId },
      });

      if (maintenanceTypesCount > 0) {
        return {
          success: false,
          error: `Cannot delete category. It is being used by ${maintenanceTypesCount} maintenance type(s)`,
          data: false,
        };
      }

      await prisma.maintenanceCategory.delete({
        where: { id },
      });

      revalidatePath("/maintenance-flows");
      await createAuditLog({
        companyId,
        action: "MAINTENANCE_CATEGORY_DELETED",
        entity: "MAINTENANCE_CATEGORY",
        entityId: id,
        details: `Maintenance category deleted: ${existingCategory.name} by user ${user.id}`,
      });
      return { success: true, data: true };
    } catch (error) {
      return handleError(error, false);
    }
  },
);

// MAINTENANCE TYPES

// Get all maintenance types for a company
export const getMaintenanceTypes = withAuth(
  async (
    user,
    filters: { category?: string; isActive?: boolean } = {},
  ): Promise<AuthResponse<MaintenanceType[]>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: [],
        };
      }

      const where: any = { companyId };

      if (filters.category) {
        where.categoryId = filters.category;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      const types = await prisma.maintenanceType.findMany({
        where,
        orderBy: { name: "asc" },
      });

      return { success: true, data: parseStringify(types) };
    } catch (error) {
      return handleError(error, []);
    }
  },
);

// Create a new maintenance type
export const createMaintenanceType = withAuth(
  async (
    user,
    data: CreateMaintenanceTypeParams,
  ): Promise<AuthResponse<MaintenanceType>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceType,
        };
      }

      const validation = maintenanceTypeSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid data",
          data: {} as MaintenanceType,
        };
      }

      // Check if type name already exists for this company
      const existingType = await prisma.maintenanceType.findFirst({
        where: {
          name: validation.data.name,
          companyId,
        },
      });

      if (existingType) {
        return {
          success: false,
          error: "A maintenance type with this name already exists",
          data: {} as MaintenanceType,
        };
      }

      // Verify category exists
      const categoryExists = await prisma.maintenanceCategory.findFirst({
        where: {
          id: validation.data.categoryId,
          companyId,
        },
      });

      if (!categoryExists) {
        return {
          success: false,
          error: "Selected category does not exist",
          data: {} as MaintenanceType,
        };
      }

      const type = await prisma.maintenanceType.create({
        data: {
          ...validation.data,
          companyId,
        },
      });

      revalidatePath("/maintenance-flows");
      await createAuditLog({
        companyId,
        action: "MAINTENANCE_TYPE_CREATED",
        entity: "MAINTENANCE_TYPE",
        entityId: type.id,
        details: `Maintenance type created: ${type.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(type) };
    } catch (error) {
      return handleError(error, {} as MaintenanceType);
    }
  },
);

// Update a maintenance type
export const updateMaintenanceType = withAuth(
  async (
    user,
    id: string,
    data: CreateMaintenanceTypeParams,
  ): Promise<AuthResponse<MaintenanceType>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: {} as MaintenanceType,
        };
      }

      const validation = maintenanceTypeSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0]?.message || "Invalid data",
          data: {} as MaintenanceType,
        };
      }

      // Check if type exists and belongs to company
      const existingType = await prisma.maintenanceType.findFirst({
        where: { id, companyId },
      });

      if (!existingType) {
        return {
          success: false,
          error: "Maintenance type not found",
          data: {} as MaintenanceType,
        };
      }

      // Check if name is unique (excluding current type)
      const duplicateType = await prisma.maintenanceType.findFirst({
        where: {
          name: validation.data.name,
          companyId,
          id: { not: id },
        },
      });

      if (duplicateType) {
        return {
          success: false,
          error: "A maintenance type with this name already exists",
          data: {} as MaintenanceType,
        };
      }

      // Verify category exists
      const categoryExists = await prisma.maintenanceCategory.findFirst({
        where: {
          id: validation.data.categoryId,
          companyId,
        },
      });

      if (!categoryExists) {
        return {
          success: false,
          error: "Selected category does not exist",
          data: {} as MaintenanceType,
        };
      }

      const type = await prisma.maintenanceType.update({
        where: { id },
        data: validation.data,
      });

      revalidatePath("/maintenance-flows");
      await createAuditLog({
        companyId,
        action: "MAINTENANCE_TYPE_UPDATED",
        entity: "MAINTENANCE_TYPE",
        entityId: id,
        details: `Maintenance type updated: ${type.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(type) };
    } catch (error) {
      return handleError(error, {} as MaintenanceType);
    }
  },
);

// Delete a maintenance type
export const deleteMaintenanceType = withAuth(
  async (user, id: string): Promise<AuthResponse<boolean>> => {
    try {
      const companyId = user.privateMetadata?.companyId as string;
      if (!companyId) {
        return {
          success: false,
          error: "User is not associated with a company",
          data: false,
        };
      }

      // Check if type exists and belongs to company
      const existingType = await prisma.maintenanceType.findFirst({
        where: { id, companyId },
      });

      if (!existingType) {
        return {
          success: false,
          error: "Maintenance type not found",
          data: false,
        };
      }

      await prisma.maintenanceType.delete({
        where: { id },
      });

      revalidatePath("/maintenance-flows");
      await createAuditLog({
        companyId,
        action: "MAINTENANCE_TYPE_DELETED",
        entity: "MAINTENANCE_TYPE",
        entityId: id,
        details: `Maintenance type deleted: ${existingType.name} by user ${user.id}`,
      });
      return { success: true, data: true };
    } catch (error) {
      return handleError(error, false);
    }
  },
);
