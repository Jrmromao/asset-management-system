"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export const insert = withAuth(
  async (user, values: z.infer<typeof categorySchema>) => {
    try {
      const validation = categorySchema.safeParse(values);

      if (!validation.success) {
        return {
          success: false,
          error: "Invalid input data",
        };
      }

      const { name } = validation.data;

      const category = await prisma.category.create({
        data: {
          name: name,
          companyId: user.user_metadata?.companyId,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "CATEGORY_CREATED",
        entity: "CATEGORY",
        entityId: category.id,
        details: `Category created: ${category.name} by user ${user.id}`,
      });

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Error creating category:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (
    user,
    options?: {
      orderBy?: "name" | "createdAt";
      order?: "asc" | "desc";
      search?: string;
    },
  ) => {
    try {
      const where: Prisma.CategoryWhereInput = {
        companyId: user.user_metadata?.companyId,
        ...(options?.search
          ? {
              OR: [
                {
                  name: {
                    contains: options.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      };

      const orderBy: Prisma.CategoryOrderByWithRelationInput = options?.orderBy
        ? { [options.orderBy]: options.order || "asc" }
        : { name: "asc" };

      const categories = await prisma.category.findMany({
        where,
        orderBy,
        select: {
          id: true,
          name: true,
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
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(async (user, id: string) => {
  try {
    const category = await prisma.category.delete({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
      select: {
        id: true,
        name: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      companyId: user.user_metadata?.companyId,
      action: "CATEGORY_DELETED",
      entity: "CATEGORY",
      entityId: category.id,
      details: `Category deleted: ${category.name} by user ${user.id}`,
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
  } finally {
    await prisma.$disconnect();
  }
});

export const update = withAuth(
  async (user, id: string, data: Partial<Category>) => {
    try {
      const category = await prisma.category.update({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
        data,
      });

      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "CATEGORY_UPDATED",
        entity: "CATEGORY",
        entityId: category.id,
        details: `Category updated: ${category.name} by user ${user.id}`,
      });

      return {
        success: true,
        data: category,
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        success: false,
        error: "Failed to update category",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
