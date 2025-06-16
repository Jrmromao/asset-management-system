"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export async function insert(
  values: z.infer<typeof categorySchema>,
): Promise<ActionResponse<Category>> {
  try {
    // Validate input against schema
    const validation = categorySchema.safeParse(values);

    if (!validation.success) {
      return {
        success: false,
        error: "Invalid input data",
      };
    }

    const { name } = validation.data;

    await prisma.category.create({
      data: {
        name: name,
        type: "",
        company: {
          connect: {
            id: session.user.companyId,
          },
        },
      },
    });

    // revalidatePath('/assets/create');

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error creating category:", error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "A category with this name already exists",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

export async function getAll(options?: {
  orderBy?: "name" | "createdAt";
  order?: "asc" | "desc";
  search?: string;
}): Promise<ActionResponse<StoredCategory[]>> {
  try {
    // Validate session

    // Build the where clause with proper Prisma types
    const where: Prisma.CategoryWhereInput = {
      companyId: session.user.companyId,
      ...(options?.search
        ? {
            OR: [
              {
                name: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
              {
                type: {
                  contains: options.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    // Build the orderBy with proper Prisma types
    const orderBy: Prisma.CategoryOrderByWithRelationInput = options?.orderBy
      ? { [options.orderBy]: options.order || "asc" }
      : { name: "asc" };

    // Get the categories
    const categories = await prisma.category.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        type: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

export async function remove(id: string): Promise<ActionResponse<Category>> {
  try {
    // Validate session

    // Get the category
    const category = await prisma.category.delete({
      where: {
        id: id,
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Error removing category:", error);
    return {
      success: false,
      error: "Failed to remove category",
    };
  }
}
