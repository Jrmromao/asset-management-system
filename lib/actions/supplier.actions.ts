"use server";

import { prisma } from "@/app/db";
import { auth } from "@/auth";
import { parseStringify } from "@/lib/utils";
import { supplierSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function insert(
  values: z.infer<typeof supplierSchema>,
): Promise<ActionResponse<Supplier>> {
  try {
    // Validate input
    const validation = await supplierSchema.safeParseAsync(values);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    // Check authentication
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized: Company ID not found" };
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
      company: {
        connect: {
          id: session.user.companyId,
        },
      },
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

    // Revalidate and return
    revalidatePath("/assets/create");
    return { success: true, data: parseStringify(supplier) };
  } catch (error) {
    console.error("Create supplier error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "A supplier with these details already exists" };
      }
    }

    return { error: "Failed to create supplier" };
  }
}

// Simple version without pagination
export async function getAllSimple(): Promise<ActionResponse<Supplier[]>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Not authenticated" };
    }
    const suppliers = await prisma.supplier.findMany({
      where: {
        companyId: session.user.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!suppliers) {
      return { error: "No suppliers found" };
    }

    return { data: suppliers };
  } catch (error) {
    console.error("Failed to fetch suppliers:", error);
    return { error: "Failed to fetch suppliers" };
  } finally {
    await prisma.$disconnect();
  }
}
