"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import type { StatusLabel } from "@prisma/client";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof statusLabelSchema>,
  ): Promise<AuthResponse<StatusLabel>> => {
    try {
      console.log("Insert action called with values:", values);
      console.log("User metadata:", user.user_metadata);

      const validation = statusLabelSchema.safeParse(values);
      if (!validation.success) {
        console.error("Validation failed:", validation.error.errors);
        return {
          success: false,
          data: null as any,
          error: validation.error.errors[0].message,
        };
      }

      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        console.error("User has no companyId");
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const data = validation.data;
      console.log("Validated data:", data);

      // Ensure all required fields are present with proper defaults
      const result = await prisma.statusLabel.create({
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || "",
          colorCode: data.colorCode || "#3B82F6", // Ensure color is always provided
          isArchived: data.isArchived ?? false,
          allowLoan: data.allowLoan ?? true,
          companyId: user.user_metadata.companyId,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "STATUS_LABEL_CREATED",
        entity: "STATUS_LABEL",
        entityId: result.id,
        details: `Status label created: ${result.name} by user ${user.id}`,
      });

      console.log("Database insert successful:", result);

      revalidatePath("/status-labels");
      return { success: true, data: parseStringify(result) };
    } catch (error) {
      console.error("Insert action error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "Status label name already exists in your company",
          };
        }
      }
      return {
        success: false,
        data: null as any,
        error: "Failed to create status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createStatusLabel(
  values: z.infer<typeof statusLabelSchema>,
): Promise<AuthResponse<StatusLabel>> {
  return insert(values);
}

export const getAll = withAuth(
  async (user): Promise<AuthResponse<StatusLabel[]>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const labels = await prisma.statusLabel.findMany({
        where: {
          companyId: user.user_metadata.companyId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return { success: true, data: parseStringify(labels) };
    } catch (error) {
      console.error("Error in getAll:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch status labels",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllStatusLabels(): Promise<
  AuthResponse<StatusLabel[]>
> {
  return getAll();
}

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<StatusLabel>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const label = await prisma.statusLabel.findFirst({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
      });
      if (!label) {
        return {
          success: false,
          data: null as any,
          error: "Status label not found",
        };
      }
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      console.error("Find status label error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getStatusLabel(
  id: string,
): Promise<AuthResponse<StatusLabel>> {
  return findById(id);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<StatusLabel>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const label = await prisma.statusLabel.delete({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "STATUS_LABEL_DELETED",
        entity: "STATUS_LABEL",
        entityId: label.id,
        details: `Status label deleted: ${label.name} by user ${user.id}`,
      });

      revalidatePath("/status-labels");
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Status label not found",
          };
        }
      }
      console.error("Delete status label error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to delete status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteStatusLabel(
  id: string,
): Promise<AuthResponse<StatusLabel>> {
  return remove(id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: z.infer<typeof statusLabelSchema>,
  ): Promise<AuthResponse<StatusLabel>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const label = await prisma.statusLabel.update({
        where: {
          id: id,
          companyId: user.user_metadata.companyId,
        },
        data: {
          name: data.name,
          colorCode: data.colorCode,
          isArchived: data.isArchived,
          allowLoan: data.allowLoan,
          description: data.description,
          active: data.active,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "STATUS_LABEL_UPDATED",
        entity: "STATUS_LABEL",
        entityId: label.id,
        details: `Status label updated: ${label.name} by user ${user.id}`,
      });

      revalidatePath("/status-labels");
      revalidatePath(`/status-labels/${id}`);
      return { success: true, data: parseStringify(label) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "Status label name already exists in your company",
          };
        }
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Status label not found",
          };
        }
      }
      console.error("Update status label error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to update status label",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateStatusLabel(
  id: string,
  data: z.infer<typeof statusLabelSchema>,
): Promise<AuthResponse<StatusLabel>> {
  return update(id, data);
}

export const bulkCreate = withAuth(
  async (
    user,
    statusLabels: Array<{
      name: string;
      description?: string;
      active?: boolean;
    }>,
  ): Promise<AuthResponse<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
  }>> => {
    console.log(" [statusLabel.actions] bulkCreate - Starting with user:", {
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
          "❌ [statusLabel.actions] bulkCreate - User missing companyId in user_metadata:",
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

      // Process each status label
      for (let i = 0; i < statusLabels.length; i++) {
        const statusLabelData = statusLabels[i];
        console.log(
          `[Status Label Actions] Processing status label ${i + 1}:`,
          statusLabelData,
        );
        
        try {
          // Check if status label already exists (by name and company)
          const existingStatusLabel = await prisma.statusLabel.findFirst({
            where: {
              name: statusLabelData.name,
              companyId,
            },
          });

          if (existingStatusLabel) {
            console.log(
              `[Status Label Actions] Status label with name "${statusLabelData.name}" already exists`,
            );
            errors.push({
              row: i + 1,
              error: `Status label with name "${statusLabelData.name}" already exists`,
            });
            errorCount++;
            continue;
          }

          // Validate the status label data
          console.log(`[Status Label Actions] Validating status label data:`, {
            name: statusLabelData.name,
            description: statusLabelData.description,
            active: statusLabelData.active ?? true,
            companyId,
          });
          
          const validation = statusLabelSchema.safeParse({
            name: statusLabelData.name,
            description: statusLabelData.description || "",
            colorCode: "#3B82F6", // Default color
            isArchived: !(statusLabelData.active ?? true), // Inverse of active
            allowLoan: true, // Default to true
            companyId,
          });

          if (!validation.success) {
            console.log(
              `[Status Label Actions] Validation failed for row ${i + 1}:`,
              validation.error.errors,
            );
            errors.push({
              row: i + 1,
              error: validation.error.errors[0].message,
            });
            errorCount++;
            continue;
          }

          // Create the status label
          const statusLabel = await prisma.statusLabel.create({
            data: {
              name: statusLabelData.name,
              description: statusLabelData.description || "",
              colorCode: "#3B82F6", // Default color
              isArchived: !(statusLabelData.active ?? true), // Inverse of active
              allowLoan: true, // Default to true
              companyId,
            },
          });

          console.log(
            `[Status Label Actions] Successfully created status label:`,
            statusLabel.name,
          );
          successCount++;

          // Create audit log
          await createAuditLog({
            companyId,
            action: "STATUS_LABEL_CREATED",
            entity: "STATUS_LABEL",
            entityId: statusLabel.id,
            details: `Status label created via bulk import: ${statusLabel.name} by user ${user.id}`,
          });

        } catch (error) {
          console.error(
            `[Status Label Actions] Error processing status label at row ${i + 1}:`,
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
        `[Status Label Actions] Bulk create completed: ${successCount} successful, ${errorCount} errors`,
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
        "❌ [statusLabel.actions] bulkCreate - Database error:",
        error,
      );
      return {
        success: false,
        data: null as any,
        error: "Failed to create status labels",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
