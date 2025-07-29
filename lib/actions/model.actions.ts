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

export const bulkCreate = withAuth(
  async (
    user,
    models: Array<{
      name: string;
      modelNo: string;
      manufacturerName: string;
      active?: boolean;
      notes?: string;
    }>,
  ): Promise<AuthResponse<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
  }>> => {
    console.log(" [model.actions] bulkCreate - Starting with user:", {
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
          "❌ [model.actions] bulkCreate - User missing companyId in user_metadata:",
          {
            user: user?.id,
            user_metadata: user?.user_metadata,
          },
        );
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: Array<{ row: number; error: string }> = [];

      // Process each model
      for (let i = 0; i < models.length; i++) {
        const modelData = models[i];
        console.log(
          `[Model Actions] Processing model ${i + 1}:`,
          modelData,
        );
        
        try {
          // First, find the manufacturer by name
          const manufacturer = await prisma.manufacturer.findFirst({
            where: {
              name: modelData.manufacturerName,
              companyId,
            },
          });

          if (!manufacturer) {
            console.log(
              `[Model Actions] Manufacturer "${modelData.manufacturerName}" not found`,
            );
            errors.push({
              row: i + 1,
              error: `Manufacturer "${modelData.manufacturerName}" not found. Please create the manufacturer first.`,
            });
            errorCount++;
            continue;
          }

          // Validate the model data
          console.log(`[Model Actions] Validating model data:`, {
            name: modelData.name,
            modelNo: modelData.modelNo,
            manufacturerId: manufacturer.id,
            active: modelData.active ?? true,
            notes: modelData.notes,
          });
          
          const validation = modelSchema.safeParse({
            name: modelData.name,
            modelNo: modelData.modelNo,
            manufacturerId: manufacturer.id,
            active: modelData.active ?? true,
            notes: modelData.notes,
            companyId,
          });

          if (!validation.success) {
            console.log(
              `[Model Actions] Validation failed for row ${i + 1}:`,
              validation.error.errors,
            );
            errors.push({
              row: i + 1,
              error: validation.error.errors[0].message,
            });
            errorCount++;
            continue;
          }

          // Check if model already exists (by modelNo and company)
          const existingModel = await prisma.model.findFirst({
            where: {
              modelNo: modelData.modelNo,
              companyId,
            },
          });

          if (existingModel) {
            console.log(
              `[Model Actions] Model with modelNo "${modelData.modelNo}" already exists`,
            );
            errors.push({
              row: i + 1,
              error: `Model with model number "${modelData.modelNo}" already exists`,
            });
            errorCount++;
            continue;
          }

          // Create the model
          const model = await prisma.model.create({
            data: {
              name: modelData.name,
              modelNo: modelData.modelNo,
              manufacturerId: manufacturer.id,
              active: modelData.active ?? true,
              notes: modelData.notes,
              companyId,
            },
          });

          console.log(
            `[Model Actions] Successfully created model:`,
            model.name,
          );
          successCount++;

          // Create audit log
          await createAuditLog({
            companyId,
            action: "MODEL_CREATED",
            entity: "MODEL",
            entityId: model.id,
            details: `Model created via bulk import: ${model.name} by user ${user.id}`,
          });

        } catch (error) {
          console.error(
            `[Model Actions] Error processing model at row ${i + 1}:`,
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
        `[Model Actions] Bulk create completed: ${successCount} successful, ${errorCount} errors`,
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
        "❌ [model.actions] bulkCreate - Database error:",
        error,
      );
      return {
        success: false,
        data: null as any,
        error: "Failed to create models",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
