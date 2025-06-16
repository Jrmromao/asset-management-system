"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";

export async function insert(
  values: z.infer<typeof modelSchema>,
): Promise<ActionResponse<Model>> {
  try {
    const validation = modelSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const model = await prisma.model.create({
      data: {
        ...validation.data,
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
}

export async function getAll(
  params?: QueryParams,
): Promise<ActionResponse<Model[]>> {
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
}

export async function getAllSimple(
  params?: QueryParams,
): Promise<ActionResponse<Model[]>> {
  try {
    // Build query
    const where: Prisma.ModelWhereInput = {
      ...(params?.categoryId && { categoryId: params.categoryId }),
      ...(params?.search && {
        OR: [
          { name: { contains: params.search } },
          { modelNo: { contains: params.search } },
        ],
      }),
    };

    // Fetch models
    const models = await prisma.model.findMany({
      where,
      include: {
        manufacturer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Success response
    return {
      success: true,
      data: parseStringify(models),
    };
  } catch (error) {
    return { error: "Failed to fetch models" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function findById(id: string): Promise<ActionResponse<Model>> {
  try {
    // Fetch model
    const model = await prisma.model.findFirst({
      where: {
        id,
      },
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

    // Not found check
    if (!model) {
      return { error: "Model not found" };
    }

    // Success response
    return {
      success: true,
      data: parseStringify(model),
    };
  } catch (error) {
    return { error: "Failed to fetch model" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function remove(id: string): Promise<ActionResponse<Model>> {
  try {
    // Delete model
    await prisma.model.delete({
      where: {
        id,
      },
    });

    // Success response
    return {
      success: true,
      data: parseStringify({ id }),
    };
  } catch (error) {
    return { error: "Failed to delete model" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function update(
  id: string,
  data: Partial<Model>,
): Promise<ActionResponse<Model>> {
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

    return { data: parseStringify(model) };
  } catch (error) {
    console.error("Update model error:", error);
    return { error: "Failed to update model" };
  } finally {
    await prisma.$disconnect();
  }
}
