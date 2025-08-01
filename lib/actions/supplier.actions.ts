"use server";

import { prisma } from "@/app/db";
import { parseStringify } from "@/lib/utils";
import { supplierSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, Supplier } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

// Standardized response type
export type ActionResponse<T> = {
  success: boolean;
  data: T | undefined;
  error?: string;
};

// Insert a new supplier
export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof supplierSchema>,
  ): Promise<ActionResponse<Supplier>> => {
    try {
      // Validate input
      const validation = await supplierSchema.safeParseAsync(values);
      if (!validation.success) {
        return {
          success: false,
          data: undefined,
          error: validation.error.errors[0].message,
        };
      }

      const supplierData: Prisma.SupplierCreateInput = {
        name: validation.data.name,
        contactName: validation.data.contactName,
        email: validation.data.email!,
        addressLine1: validation.data.addressLine1,
        city: validation.data.city,
        state: validation.data.state,
        zip: validation.data.zip,
        country: validation.data.country,
        company: { connect: { id: user.user_metadata?.companyId } },
        ...(validation.data.phoneNum && { phoneNum: validation.data.phoneNum }),
        ...(validation.data.url && { url: validation.data.url }),
        ...(validation.data.notes && { notes: validation.data.notes }),
        ...(validation.data.addressLine2 && {
          addressLine2: validation.data.addressLine2,
        }),
      };

      // Create supplier
      const supplier = await prisma.supplier.create({
        data: supplierData,
      });

      revalidatePath("/assets/create");
      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "SUPPLIER_CREATED",
        entity: "SUPPLIER",
        entityId: supplier.id,
        details: `Supplier created: ${supplier.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Create supplier error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: undefined,
            error: "A supplier with these details already exists",
          };
        }
      }
      return {
        success: false,
        data: undefined,
        error: "Failed to create supplier",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Get all suppliers
export const getAll = withAuth(
  async (user): Promise<ActionResponse<Supplier[]>> => {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { companyId: user.user_metadata?.companyId },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!suppliers || suppliers.length === 0) {
        return { success: false, data: undefined, error: "No suppliers found" };
      }
      return { success: true, data: parseStringify(suppliers) };
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      return {
        success: false,
        data: undefined,
        error: "Failed to fetch suppliers",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Get supplier by ID
export const getById = withAuth(
  async (user, id: string): Promise<ActionResponse<Supplier>> => {
    try {
      // Check if user has companyId
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          data: undefined,
          error: "User is not associated with a company",
        };
      }

      const supplier = await prisma.supplier.findFirst({
        where: { id, companyId },
      });
      if (!supplier) {
        return { success: false, data: undefined, error: "Supplier not found" };
      }
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      return {
        success: false,
        data: undefined,
        error: "Failed to fetch supplier",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Update supplier
export const update = withAuth(
  async (
    user,
    id: string,
    values: z.infer<typeof supplierSchema>,
  ): Promise<ActionResponse<Supplier>> => {
    try {
      // Validate input
      const validation = await supplierSchema.safeParseAsync(values);
      if (!validation.success) {
        return {
          success: false,
          data: undefined,
          error: validation.error.errors[0].message,
        };
      }

      // Check if user has companyId
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          data: undefined,
          error: "User is not associated with a company",
        };
      }

      // First, check if the supplier exists and belongs to the user's company
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          id,
          companyId,
        },
      });

      if (!existingSupplier) {
        return {
          success: false,
          data: undefined,
          error: "Supplier not found or you don't have permission to update it",
        };
      }

      const supplierData: Prisma.SupplierUpdateInput = {
        name: validation.data.name,
        contactName: validation.data.contactName,
        email: validation.data.email!,
        addressLine1: validation.data.addressLine1,
        city: validation.data.city,
        state: validation.data.state,
        zip: validation.data.zip,
        country: validation.data.country,
        ...(validation.data.phoneNum && { phoneNum: validation.data.phoneNum }),
        ...(validation.data.url && { url: validation.data.url }),
        ...(validation.data.notes && { notes: validation.data.notes }),
        ...(validation.data.addressLine2 && {
          addressLine2: validation.data.addressLine2,
        }),
        ...(typeof validation.data.active === "boolean"
          ? { active: validation.data.active }
          : {}),
      };

      // Update supplier
      const supplier = await prisma.supplier.update({
        where: { id, companyId },
        data: supplierData,
      });

      revalidatePath("/assets/create");
      await createAuditLog({
        companyId,
        action: "SUPPLIER_UPDATED",
        entity: "SUPPLIER",
        entityId: supplier.id,
        details: `Supplier updated: ${supplier.name} by user ${user.id}`,
      });
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Failed to update supplier:", error);
      return {
        success: false,
        data: undefined,
        error: "Failed to update supplier",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Remove supplier
export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Supplier>> => {
    try {
      // Check if user has companyId
      const companyId = user.user_metadata?.companyId;
      if (!companyId) {
        return {
          success: false,
          data: undefined,
          error: "User is not associated with a company",
        };
      }

      // First, check if the supplier exists and belongs to the user's company
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          id,
          companyId,
        },
      });

      if (!existingSupplier) {
        return {
          success: false,
          data: undefined,
          error: "Supplier not found or you don't have permission to delete it",
        };
      }

      // Delete the supplier
      const supplier = await prisma.supplier.delete({
        where: { id, companyId },
      });

      revalidatePath("/assets/create");
      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "SUPPLIER_DELETED",
        entity: "SUPPLIER",
        entityId: supplier.id,
        details: `Supplier deleted: ${supplier.name} by user ${user.id}`,
      });

      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Delete supplier error:", error);
      return {
        success: false,
        data: undefined,
        error: "Failed to delete supplier",
      };
    }
  },
);

export const bulkCreate = withAuth(
  async (
    user,
    suppliers: Array<{
      name: string;
      contactName: string;
      email: string;
      phoneNum?: string;
      url?: string;
      notes?: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      active?: boolean;
    }>,
  ): Promise<
    ActionResponse<{
      successCount: number;
      errorCount: number;
      errors: Array<{ row: number; error: string }>;
    }>
  > => {
    console.log(" [supplier.actions] bulkCreate - Starting with user:", {
      userId: user?.id,
      user_metadata: user?.user_metadata,
      hasCompanyId: !!user?.user_metadata?.companyId,
      companyId: user?.user_metadata?.companyId,
    });

    try {
      // Get companyId from user metadata
      const companyId = user.user_metadata?.companyId;

      if (!companyId) {
        console.error(
          "❌ [supplier.actions] bulkCreate - User missing companyId in user_metadata:",
          {
            user: user?.id,
            user_metadata: user?.user_metadata,
          },
        );
        return {
          success: false,
          data: undefined,
          error: "User is not associated with a company",
        };
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: Array<{ row: number; error: string }> = [];

      // Process each supplier
      for (let i = 0; i < suppliers.length; i++) {
        const supplierData = suppliers[i];
        console.log(
          `[Supplier Actions] Processing supplier ${i + 1}:`,
          supplierData,
        );

        try {
          // Validate the supplier data
          console.log(`[Supplier Actions] Validating supplier data:`, {
            name: supplierData.name,
            contactName: supplierData.contactName,
            email: supplierData.email,
            phoneNum: supplierData.phoneNum,
            url: supplierData.url,
            notes: supplierData.notes,
            addressLine1: supplierData.addressLine1,
            addressLine2: supplierData.addressLine2,
            city: supplierData.city,
            state: supplierData.state,
            zip: supplierData.zip,
            country: supplierData.country,
            active: supplierData.active ?? true,
          });

          const validation = supplierSchema.safeParse({
            name: supplierData.name,
            contactName: supplierData.contactName,
            email: supplierData.email,
            phoneNum: supplierData.phoneNum,
            url: supplierData.url,
            notes: supplierData.notes,
            active: supplierData.active ?? true,
            addressLine1: supplierData.addressLine1,
            addressLine2: supplierData.addressLine2,
            city: supplierData.city,
            state: supplierData.state,
            zip: supplierData.zip,
            country: supplierData.country,
          });

          if (!validation.success) {
            console.log(
              `[Supplier Actions] Validation failed for row ${i + 1}:`,
              validation.error.errors,
            );
            errors.push({
              row: i + 1,
              error: validation.error.errors[0].message,
            });
            errorCount++;
            continue;
          }

          // Check if supplier already exists (by name and company)
          const existingSupplier = await prisma.supplier.findFirst({
            where: {
              name: supplierData.name,
              companyId,
            },
          });

          if (existingSupplier) {
            console.log(
              `[Supplier Actions] Supplier "${supplierData.name}" already exists`,
            );
            errors.push({
              row: i + 1,
              error: `Supplier "${supplierData.name}" already exists`,
            });
            errorCount++;
            continue;
          }

          // Create the supplier
          const supplier = await prisma.supplier.create({
            data: {
              name: supplierData.name,
              contactName: supplierData.contactName,
              email: supplierData.email,
              phoneNum: supplierData.phoneNum,
              url: supplierData.url,
              notes: supplierData.notes,
              active: supplierData.active ?? true,
              addressLine1: supplierData.addressLine1,
              addressLine2: supplierData.addressLine2,
              city: supplierData.city,
              state: supplierData.state,
              zip: supplierData.zip,
              country: supplierData.country,
              companyId,
            },
          });

          console.log(
            `[Supplier Actions] Successfully created supplier:`,
            supplier.name,
          );
          successCount++;

          // Create audit log
          await createAuditLog({
            companyId,
            action: "SUPPLIER_CREATED",
            entity: "SUPPLIER",
            entityId: supplier.id,
            details: `Supplier created via bulk import: ${supplier.name} by user ${user.id}`,
          });
        } catch (error) {
          console.error(
            `[Supplier Actions] Error processing supplier at row ${i + 1}:`,
            error,
          );
          errors.push({
            row: i + 1,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
          errorCount++;
        }
      }

      console.log(
        `[Supplier Actions] Bulk create completed: ${successCount} successful, ${errorCount} errors`,
      );

      return {
        success: true,
        data: {
          successCount,
          errorCount,
          errors,
        },
      };
    } catch (error) {
      console.error(
        "❌ [supplier.actions] bulkCreate - Database error:",
        error,
      );
      return {
        success: false,
        data: undefined,
        error: "Failed to create suppliers",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function createSupplier(values: z.infer<typeof supplierSchema>) {
  return insert(values);
}

export async function getAllSuppliers() {
  return getAll();
}

export async function getSupplierById(id: string) {
  return getById(id);
}

export async function updateSupplier(
  id: string,
  values: z.infer<typeof supplierSchema>,
) {
  return update(id, values);
}

export async function deleteSupplier(id: string) {
  return remove(id);
}
