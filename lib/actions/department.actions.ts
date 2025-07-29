"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { z } from "zod";
import { departmentSchema } from "@/lib/schemas";
import type { Department } from "@prisma/client";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export const insert = withAuth(
  async (
    user,
    data: z.infer<typeof departmentSchema>,
  ): Promise<AuthResponse<Department>> => {
    console.log(" [department.actions] insert - Starting with user:", {
      userId: user?.id,
      privateMetadata: user?.privateMetadata,
      hasCompanyId: !!user?.privateMetadata?.companyId,
    });

    try {
      const validation = departmentSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          data: null as any,
          error: validation.error.errors[0].message,
        };
      }

      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        console.error(
          "❌ [department.actions] insert - User missing companyId in private metadata:",
          {
            user: user?.id,
            privateMetadata: user?.privateMetadata,
          },
        );
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      console.log(
        "✅ [department.actions] insert - Creating department with data:",
        {
          ...validation.data,
          companyId,
        },
      );

      const department = await prisma.department.create({
        data: {
          ...validation.data,
          companyId,
        },
      });

      await createAuditLog({
        companyId,
        action: "DEPARTMENT_CREATED",
        entity: "DEPARTMENT",
        entityId: department.id,
        details: `Department created: ${department.name} by user ${user.id}`,
      });

      revalidatePath("/departments");
      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "Department name already exists in your company",
          };
        }
      }
      console.error("Create department error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to create department",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<AuthResponse<Department[]>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const where: Prisma.DepartmentWhereInput = {
        companyId,
        ...(params?.search && {
          name: {
            contains: params.search,
            mode: "insensitive",
          },
        }),
      };

      const departments = await prisma.department.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: parseStringify(departments),
      };
    } catch (error) {
      console.error("Get departments error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch departments",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<Department>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const department = await prisma.department.findFirst({
        where: {
          id,
          companyId,
        },
      });

      if (!department) {
        return {
          success: false,
          data: null as any,
          error: "Department not found",
        };
      }

      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      console.error("Find department error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch department",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const update = withAuth(
  async (
    user,
    id: string,
    data: z.infer<typeof departmentSchema>,
  ): Promise<AuthResponse<Department>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      console.log(
        " [department.actions] update - Updating department with data:",
        {
          id,
          data,
        },
      );

      const department = await prisma.department.update({
        where: {
          id,
          companyId,
        },
        data: {
          name: data.name,
          active: data.active,
        },
      });

      await createAuditLog({
        companyId,
        action: "DEPARTMENT_UPDATED",
        entity: "DEPARTMENT",
        entityId: department.id,
        details: `Department updated: ${department.name} by user ${user.id}`,
      });

      revalidatePath("/departments");
      revalidatePath(`/departments/${id}`);
      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "Department name already exists in your company",
          };
        }
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Department not found",
          };
        }
      }
      console.error("Update department error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to update department",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Department>> => {
    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const department = await prisma.department.delete({
        where: {
          id,
          companyId,
        },
      });

      await createAuditLog({
        companyId,
        action: "DEPARTMENT_DELETED",
        entity: "DEPARTMENT",
        entityId: department.id,
        details: `Department deleted: ${department.name} by user ${user.id}`,
      });

      revalidatePath("/departments");
      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Department not found",
          };
        }
      }
      console.error("Delete department error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to delete department",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const bulkCreate = withAuth(
  async (
    user,
    departments: Array<{ name: string; active?: boolean }>,
  ): Promise<
    AuthResponse<{
      successCount: number;
      errorCount: number;
      errors: Array<{ row: number; error: string }>;
    }>
  > => {
    console.log(" [department.actions] bulkCreate - Starting with user:", {
      userId: user?.id,
      privateMetadata: user?.privateMetadata,
      hasCompanyId: !!user?.privateMetadata?.companyId,
      companyId: user?.privateMetadata?.companyId,
    });

    try {
      // Get companyId from private metadata
      const companyId = user.privateMetadata?.companyId;

      if (!companyId) {
        console.error(
          "❌ [department.actions] bulkCreate - User missing companyId in private metadata:",
          {
            user: user?.id,
            privateMetadata: user?.privateMetadata,
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

      // Process each department
      for (let i = 0; i < departments.length; i++) {
        const departmentData = departments[i];
        console.log(
          `[Department Actions] Processing department ${i + 1}:`,
          departmentData,
        );

        try {
          // Validate the department data
          console.log(`[Department Actions] Validating department data:`, {
            name: departmentData.name,
            active: departmentData.active ?? true,
          });

          const validation = departmentSchema.safeParse({
            name: departmentData.name,
            active: departmentData.active ?? true,
          });

          if (!validation.success) {
            console.log(
              `[Department Actions] Validation failed for row ${i + 1}:`,
              validation.error.errors,
            );
            errors.push({
              row: i + 1,
              error: validation.error.errors[0].message,
            });
            errorCount++;
            continue;
          }

          console.log(
            `[Department Actions] Validation successful for row ${i + 1}`,
          );

          // Check if department already exists
          const existingDepartment = await prisma.department.findFirst({
            where: {
              name: departmentData.name,
              companyId,
            },
          });

          if (existingDepartment) {
            errors.push({
              row: i + 1,
              error: `Department "${departmentData.name}" already exists`,
            });
            errorCount++;
            continue;
          }

          // Create the department
          const department = await prisma.department.create({
            data: {
              name: departmentData.name,
              active: departmentData.active ?? true,
              companyId,
            },
          });

          await createAuditLog({
            companyId,
            action: "DEPARTMENT_CREATED",
            entity: "DEPARTMENT",
            entityId: department.id,
            details: `Department created via bulk import: ${department.name} by user ${user.id}`,
          });

          successCount++;
        } catch (error) {
          console.error(`Error processing department at row ${i + 1}:`, error);
          errors.push({
            row: i + 1,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
          errorCount++;
        }
      }

      revalidatePath("/settings?tab=departments");
      revalidatePath("/departments");

      return {
        success: true,
        data: {
          successCount,
          errorCount,
          errors,
        },
      };
    } catch (error) {
      console.error("Bulk create departments error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to bulk create departments",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
