"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof modelSchema>,
  ): Promise<ActionResponse<Model>> => {
    if (!user?.user_metadata?.companyId) {
      return { error: "Company ID not found", success: false };
    }

    try {
      const validation = modelSchema.safeParse(values);
      if (!validation.success) {
        return { error: validation.error.errors[0].message, success: false };
      }

      const model = await prisma.model.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata.companyId,
        },
      });

      if (!model) {
        return { error: "Failed to create model", success: false };
      }

      revalidatePath("/models");
      return {
        success: true,
        data: parseStringify(model),
      };
    } catch (error) {
      console.error("Create model error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            error: "A model with this number already exists",
            success: false,
          };
        }
        return { error: `Database error: ${error.code}`, success: false };
      }
      return { error: "Failed to create model", success: false };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createModel(
  values: z.infer<typeof modelSchema>,
): Promise<ActionResponse<Model>> {
  const session = getSession();
  return insert(session, values);
}

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<ActionResponse<Model[]>> => {
    if (!user?.user_metadata?.companyId) {
      return { error: "Company ID not found", success: false };
    }

    try {
      const where: Prisma.ModelWhereInput = {
        companyId: user.user_metadata.companyId,
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
      console.error("Fetch models error:", error);
      return { error: "Failed to fetch models", success: false };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllModels(params?: {
  search?: string;
}): Promise<ActionResponse<Model[]>> {
  const session = getSession();
  return getAll(session, params);
}

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Model>> => {
    try {
      await prisma.model.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });

      revalidatePath("/models");
      return {
        success: true,
        data: parseStringify({ id }),
      };
    } catch (error) {
      return { error: "Failed to delete model", success: false };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteModel(id: string): Promise<ActionResponse<Model>> {
  const session = getSession();
  return remove(session, id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<z.infer<typeof modelSchema>>,
  ): Promise<ActionResponse<Model>> => {
    if (!user?.user_metadata?.companyId) {
      return { error: "Company ID not found", success: false };
    }

    try {
      const model = await prisma.model.update({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
        data,
      });

      if (!model) {
        return { error: "Model not found", success: false };
      }

      revalidatePath("/models");
      return {
        success: true,
        data: parseStringify(model),
      };
    } catch (error) {
      console.error("Update model error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            error: "A model with this number already exists",
            success: false,
          };
        }
        if (error.code === "P2025") {
          return { error: "Model not found", success: false };
        }
        return { error: `Database error: ${error.code}`, success: false };
      }
      return { error: "Failed to update model", success: false };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateModel(
  id: string,
  data: Partial<z.infer<typeof modelSchema>>,
): Promise<ActionResponse<Model>> {
  const session = getSession();
  return update(session, id, data);
}
