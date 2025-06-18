"use server";

import { prisma } from "@/app/db";
import { parseStringify } from "@/lib/utils";
import { supplierSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";

// Standardized response type
interface SupplierActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Insert a new supplier
export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof supplierSchema>,
  ): Promise<SupplierActionResponse<Supplier>> => {
    try {
      // Validate input
      const validation = await supplierSchema.safeParseAsync(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
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
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Create supplier error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            error: "A supplier with these details already exists",
          };
        }
      }
      return { success: false, error: "Failed to create supplier" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Get all suppliers
export const getAll = withAuth(
  async (user): Promise<SupplierActionResponse<Supplier[]>> => {
    try {
      const suppliers = await prisma.supplier.findMany({
        where: { companyId: user.user_metadata?.companyId },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (!suppliers || suppliers.length === 0) {
        return { success: false, error: "No suppliers found" };
      }
      return { success: true, data: parseStringify(suppliers) };
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      return { success: false, error: "Failed to fetch suppliers" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Get supplier by ID
export const getById = withAuth(
  async (user, id: string): Promise<SupplierActionResponse<Supplier>> => {
    try {
      const supplier = await prisma.supplier.findUnique({
        where: { id, companyId: user.user_metadata?.companyId },
      });
      if (!supplier) {
        return { success: false, error: "Supplier not found" };
      }
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Failed to fetch supplier:", error);
      return { success: false, error: "Failed to fetch supplier" };
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
  ): Promise<SupplierActionResponse<Supplier>> => {
    try {
      // Validate input
      const validation = await supplierSchema.safeParseAsync(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
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
      };

      // Update supplier
      const supplier = await prisma.supplier.update({
        where: { id, companyId: user.user_metadata?.companyId },
        data: supplierData,
      });

      revalidatePath("/assets/create");
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Failed to update supplier:", error);
      return { success: false, error: "Failed to update supplier" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Remove supplier
export const remove = withAuth(
  async (user, id: string): Promise<SupplierActionResponse<Supplier>> => {
    try {
      const supplier = await prisma.supplier.delete({
        where: { id, companyId: user.user_metadata?.companyId },
      });
      revalidatePath("/assets/create");
      return { success: true, data: parseStringify(supplier) };
    } catch (error) {
      console.error("Failed to delete supplier:", error);
      return { success: false, error: "Failed to delete supplier" };
    } finally {
      await prisma.$disconnect();
    }
  },
);
