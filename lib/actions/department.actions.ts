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

      console.log(" [department.actions] update - Updating department with data:", {
        id,
        data,
      });

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
