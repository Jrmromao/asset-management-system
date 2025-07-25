"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";
import { withAuth, AuthResponse } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { ModelWithRelations } from "@/types/model";
import { Model } from "@prisma/client";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

const getSession = async () => {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof modelSchema>,
  ): Promise<AuthResponse<ModelWithRelations>> => {
    if (!user?.user_metadata?.companyId) {
      return {
        error: "Company ID not found",
        success: false,
        data: null as unknown as ModelWithRelations,
      };
    }

    try {
      const dataToValidate = {
        ...values,
        companyId: user.user_metadata.companyId,
      };

      const validation = modelSchema.safeParse(dataToValidate);
      if (!validation.success) {
        return {
          error: validation.error.errors[0].message,
          success: false,
          data: null as unknown as ModelWithRelations,
        };
      }

      const model = await prisma.model.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata.companyId,
        },
        include: {
          manufacturer: { select: { name: true } },
        },
      });

      if (!model) {
        return {
          error: "Failed to create model",
          success: false,
          data: null as unknown as ModelWithRelations,
        };
      }

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "MODEL_CREATED",
        entity: "MODEL",
        entityId: model.id,
        details: `Model created: ${model.name} by user ${user.id}`,
      });

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
            data: null as unknown as ModelWithRelations,
          };
        }
        return {
          error: `Database error: ${error.code}`,
          success: false,
          data: null as unknown as ModelWithRelations,
        };
      }
      return {
        error: "Failed to create model",
        success: false,
        data: null as unknown as ModelWithRelations,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createModel(
  values: z.infer<typeof modelSchema>,
): Promise<AuthResponse<ModelWithRelations>> {
  const session = getSession();
  return insert(values);
}

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<AuthResponse<ModelWithRelations[]>> => {
    if (!user?.user_metadata?.companyId) {
      return {
        error: "Company ID not found",
        success: false,
        data: [],
      };
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
      return {
        error: "Failed to fetch models",
        success: false,
        data: [],
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllModels(params?: {
  search?: string;
}): Promise<AuthResponse<ModelWithRelations[]>> {
  const session = getSession();
  return getAll(params);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Model>> => {
    try {
      await prisma.model.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "MODEL_DELETED",
        entity: "MODEL",
        entityId: id,
        details: `Model deleted: ${id} by user ${user.id}`,
      });

      revalidatePath("/models");
      return {
        success: true,
        data: parseStringify({ id } as Model),
      };
    } catch (error) {
      return {
        error: "Failed to delete model",
        success: false,
        data: null as unknown as Model,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteModel(id: string): Promise<AuthResponse<Model>> {
  const session = getSession();
  return remove(id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<z.infer<typeof modelSchema>>,
  ): Promise<AuthResponse<ModelWithRelations>> => {
    if (!user?.user_metadata?.companyId) {
      return {
        error: "Company ID not found",
        success: false,
        data: null as unknown as ModelWithRelations,
      };
    }

    try {
      const model = await prisma.model.update({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
        data,
        include: {
          manufacturer: { select: { name: true } },
        },
      });

      if (!model) {
        return {
          error: "Model not found",
          success: false,
          data: null as unknown as ModelWithRelations,
        };
      }

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "MODEL_UPDATED",
        entity: "MODEL",
        entityId: model.id,
        details: `Model updated: ${model.name} by user ${user.id}`,
      });

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
            data: null as unknown as ModelWithRelations,
          };
        }
        if (error.code === "P2025") {
          return {
            error: "Model not found",
            success: false,
            data: null as unknown as ModelWithRelations,
          };
        }
        return {
          error: `Database error: ${error.code}`,
          success: false,
          data: null as unknown as ModelWithRelations,
        };
      }
      return {
        error: "Failed to update model",
        success: false,
        data: null as unknown as ModelWithRelations,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateModel(
  id: string,
  data: Partial<z.infer<typeof modelSchema>>,
): Promise<AuthResponse<ModelWithRelations>> {
  const session = getSession();
  return update(id, data);
}
