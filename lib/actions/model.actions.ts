"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof modelSchema>,
  ): Promise<ActionResponse<Model>> => {
    try {
      const validation = modelSchema.safeParse(values);
      if (!validation.success) {
        return { error: validation.error.errors[0].message };
      }

      const model = await prisma.model.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata?.companyId,
        },
      });

      if (!model) {
        return { error: "Failed to create model" };
      }

      return {
        success: true,
        data: parseStringify(model),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return { error: "A model with this number already exists" };
        }
      }
      return { error: "Failed to create model" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (user, params?: QueryParams): Promise<ActionResponse<Model[]>> => {
    try {
      const where: Prisma.ModelWhereInput = {
        ...(params?.categoryId && { categoryId: params.categoryId }),
        ...(params?.search && {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { modelNo: { contains: params.search, mode: "insensitive" } },
          ],
        }),
      };

      const models = await prisma.model.findMany({
        where,
        include: {
          manufacturer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: parseStringify(models),
      };
    } catch (error) {
      return { error: "Failed to fetch models" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAllSimple = withAuth(
  async (user, params?: QueryParams): Promise<ActionResponse<Model[]>> => {
    try {
      const where: Prisma.ModelWhereInput = {
        ...(params?.categoryId && { categoryId: params.categoryId }),
        ...(params?.search && {
          OR: [
            { name: { contains: params.search } },
            { modelNo: { contains: params.search } },
          ],
        }),
      };

      const models = await prisma.model.findMany({
        where,
        include: {
          manufacturer: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: parseStringify(models),
      };
    } catch (error) {
      return { error: "Failed to fetch models" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<Model>> => {
    try {
      const model = await prisma.model.findFirst({
        where: { id },
        include: {
          manufacturer: true,
          assets: {
            select: {
              id: true,
              name: true,
              serialNumber: true,
              statusLabel: {
                select: {
                  name: true,
                  colorCode: true,
                },
              },
            },
          },
        },
      });

      if (!model) {
        return { error: "Model not found" };
      }

      return {
        success: true,
        data: parseStringify(model),
      };
    } catch (error) {
      return { error: "Failed to fetch model" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Model>> => {
    try {
      await prisma.model.delete({
        where: { id },
      });

      return {
        success: true,
        data: parseStringify({ id }),
      };
    } catch (error) {
      return { error: "Failed to delete model" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<Model>,
  ): Promise<ActionResponse<Model>> => {
    try {
      const model = await prisma.model.update({
        where: { id },
        data: {
          name: data.name,
          modelNo: data.modelNo,
          active: data.active,
          manufacturerId: data.manufacturerId,
        },
      });

      return {
        success: true,
        data: parseStringify(model),
      };
    } catch (error) {
      console.error("Update model error:", error);
      return { error: "Failed to update model" };
    } finally {
      await prisma.$disconnect();
    }
  },
);
