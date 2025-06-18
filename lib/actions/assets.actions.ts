"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";

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
          type: "",
          companyId: user.user_metadata?.companyId,
        },
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

      const orderBy: Prisma.CategoryOrderByWithRelationInput = options?.orderBy
        ? { [options.orderBy]: options.order || "asc" }
        : { name: "asc" };

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
  } finally {
    await prisma.$disconnect();
  }
});

export const update = withAuth(
  async (user, id: string, data: Partial<Asset>) => {
    try {
      const asset = await prisma.asset.update({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
        data: data as Prisma.AssetUpdateInput,
      });

      return {
        success: true,
        data: asset,
      };
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  },
);

export const findById = withAuth(async (user, id: string) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
    });

    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    console.error("Error finding asset:", error);
    return {
      success: false,
      error: "Failed to find asset",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const checkin = withAuth(async (user, id: string) => {
  try {
    const asset = await prisma.asset.update({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
      data: {
        status: "CHECKED_IN",
      },
    });
    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    console.error("Error checking in asset:", error);
    return {
      success: false,
      error: "Failed to check in asset",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const checkout = withAuth(async (user, id: string) => {
  try {
    const asset = await prisma.asset.update({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
      data: {
        status: "CHECKED_OUT",
      },
    });
    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    console.error("Error checking out asset:", error);
    return {
      success: false,
      error: "Failed to check out asset",
    };
  } finally {
    await prisma.$disconnect();
  }
});
