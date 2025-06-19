"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { z } from "zod";
import { departmentSchema } from "@/lib/schemas";

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
    data: z.infer<typeof departmentSchema>,
  ): Promise<ActionResponse<Department>> => {
    try {
      const validation = departmentSchema.safeParse(data);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }
      const department = await prisma.department.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata?.companyId,
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
            error: "Department name already exists in your company",
          };
        }
      }
      console.error("Create department error:", error);
      return { success: false, error: "Failed to create department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createDepartment(
  data: z.infer<typeof departmentSchema>,
): Promise<ActionResponse<Department>> {
  const session = getSession();
  return insert(session, data);
}

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<ActionResponse<Department[]>> => {
    try {
      const where: Prisma.DepartmentWhereInput = {
        companyId: user.user_metadata?.companyId,
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
      return { success: false, error: "Failed to fetch departments" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllDepartments(params?: {
  search?: string;
}): Promise<ActionResponse<Department[]>> {
  const session = getSession();
  return getAll(session, params);
}

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<Department>> => {
    try {
      const department = await prisma.department.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });

      if (!department) {
        return { success: false, error: "Department not found" };
      }

      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      console.error("Find department error:", error);
      return { success: false, error: "Failed to fetch department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getDepartment(
  id: string,
): Promise<ActionResponse<Department>> {
  const session = getSession();
  return findById(session, id);
}

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<Department>,
  ): Promise<ActionResponse<Department>> => {
    try {
      const department = await prisma.department.update({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
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
            error: "Department name already exists in your company",
          };
        }
        if (error.code === "P2025") {
          return { success: false, error: "Department not found" };
        }
      }
      console.error("Update department error:", error);
      return { success: false, error: "Failed to update department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateDepartment(
  id: string,
  data: Partial<Department>,
): Promise<ActionResponse<Department>> {
  const session = getSession();
  return update(session, id, data);
}

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Department>> => {
    try {
      const department = await prisma.department.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
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
          return { success: false, error: "Department not found" };
        }
      }
      console.error("Delete department error:", error);
      return { success: false, error: "Failed to delete department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteDepartment(
  id: string,
): Promise<ActionResponse<Department>> {
  const session = getSession();
  return remove(session, id);
}
