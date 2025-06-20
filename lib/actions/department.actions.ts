"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { z } from "zod";
import { departmentSchema } from "@/lib/schemas";
import type { Department } from "@prisma/client";

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
    data: z.infer<typeof departmentSchema>,
  ): Promise<AuthResponse<Department>> => {
    try {
      const validation = departmentSchema.safeParse(data);
      if (!validation.success) {
        return { success: false, data: null as any, error: validation.error.errors[0].message };
      }
      
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const department = await prisma.department.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata.companyId,
        },
      });

      revalidatePath("/assets/create");
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
      return { success: false, data: null as any, error: "Failed to create department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createDepartment(
  data: z.infer<typeof departmentSchema>,
): Promise<AuthResponse<Department>> {
  const session = getSession();
  return insert(data);
}

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<AuthResponse<Department[]>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const where: Prisma.DepartmentWhereInput = {
        companyId: user.user_metadata.companyId,
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
      return { success: false, data: null as any, error: "Failed to fetch departments" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllDepartments(params?: {
  search?: string;
}): Promise<AuthResponse<Department[]>> {
  const session = getSession();
  return getAll(params);
}

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<Department>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const department = await prisma.department.findFirst({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });

      if (!department) {
        return { success: false, data: null as any, error: "Department not found" };
      }

      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      console.error("Find department error:", error);
      return { success: false, data: null as any, error: "Failed to fetch department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getDepartment(
  id: string,
): Promise<AuthResponse<Department>> {
  const session = getSession();
  return findById(id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<Department>,
  ): Promise<AuthResponse<Department>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const department = await prisma.department.update({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
        data: {
          name: data.name,
        },
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
          return { success: false, data: null as any, error: "Department not found" };
        }
      }
      console.error("Update department error:", error);
      return { success: false, data: null as any, error: "Failed to update department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateDepartment(
  id: string,
  data: Partial<Department>,
): Promise<AuthResponse<Department>> {
  const session = getSession();
  return update(id, data);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<Department>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const department = await prisma.department.delete({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });

      revalidatePath("/departments");
      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return { success: false, data: null as any, error: "Department not found" };
        }
      }
      console.error("Delete department error:", error);
      return { success: false, data: null as any, error: "Failed to delete department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteDepartment(
  id: string,
): Promise<AuthResponse<Department>> {
  const session = getSession();
  return remove(id);
}