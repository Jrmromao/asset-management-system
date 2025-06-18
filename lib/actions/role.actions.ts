"use server";

import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";

type ActionReturn<T> = {
  data?: T;
  error?: string;
  success?: boolean;
};

export const getAll = withAuth(async (user): Promise<ActionReturn<Role[]>> => {
  try {
    const roles = await prisma.role.findMany({
      where: {},
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
    return { success: true, data: parseStringify(roles) };
  } catch (error) {
    console.error("Get roles error:", error);
    return { success: false, error: "Failed to fetch roles" };
  } finally {
    await prisma.$disconnect();
  }
});

export const insert = withAuth(
  async (user, data: Pick<Role, "name">): Promise<ActionReturn<Role>> => {
    try {
      const existingRole = await prisma.role.findFirst({
        where: {
          name: data.name,
        },
      });
      if (existingRole) {
        return { success: false, error: "Role with this name already exists" };
      }
      const role = await prisma.role.create({
        data: {
          name: data.name,
        },
      });
      revalidatePath("/roles");
      return { success: true, data: parseStringify(role) };
    } catch (error) {
      console.error("Create role error:", error);
      return { success: false, error: "Failed to create role" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getRoleById = withAuth(
  async (user, id: string): Promise<ActionReturn<Role>> => {
    try {
      const role = await prisma.role.findFirst({
        where: {
          id,
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      if (!role) {
        return { success: false, error: "Role not found" };
      }
      return { success: true, data: parseStringify(role) };
    } catch (error) {
      console.error("Get role error:", error);
      return { success: false, error: "Failed to fetch role" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<ActionReturn<Role>> => {
    try {
      const role = await prisma.role.delete({
        where: {
          id,
        },
      });
      return { success: true, data: parseStringify(role) };
    } catch (error) {
      console.error("Delete role error:", error);
      return { success: false, error: "Failed to delete role" };
    } finally {
      await prisma.$disconnect();
    }
  },
);
