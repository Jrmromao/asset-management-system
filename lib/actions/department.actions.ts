"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";

export const insert = withAuth(
  async (
    user,
    data: Pick<Department, "name">,
  ): Promise<ActionResponse<Department>> => {
    try {
      const department = await prisma.department.create({
        data: {
          ...data,
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
          return { error: "Department name already exists in your company" };
        }
      }
      console.error("Create department error:", error);
      return { error: "Failed to create department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

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
      return { error: "Failed to fetch departments" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

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
        return { error: "Department not found" };
      }

      return {
        success: true,
        data: parseStringify(department),
      };
    } catch (error) {
      console.error("Find department error:", error);
      return { error: "Failed to fetch department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

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
          return { error: "Department name already exists in your company" };
        }
        if (error.code === "P2025") {
          return { error: "Department not found" };
        }
      }
      console.error("Update department error:", error);
      return { error: "Failed to update department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

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
          return { error: "Department not found" };
        }
      }
      console.error("Delete department error:", error);
      return { error: "Failed to delete department" };
    } finally {
      await prisma.$disconnect();
    }
  },
);
