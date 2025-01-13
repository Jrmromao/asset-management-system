"use server";

import { PrismaClient } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

type ActionReturn<T> = {
  data?: T;
  error?: string;
};

export async function getAll(): Promise<ActionReturn<Role[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

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

    return { data: parseStringify(roles) };
  } catch (error) {
    console.error("Get roles error:", error);
    return { error: "Failed to fetch roles" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function insert(
  data: Pick<Role, "name">,
): Promise<ActionReturn<Role>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    // Check if role with same name exists in company
    const existingRole = await prisma.role.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingRole) {
      return { error: "Role with this name already exists" };
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
      },
    });

    revalidatePath("/roles");
    return { data: parseStringify(role) };
  } catch (error) {
    console.error("Create role error:", error);
    return { error: "Failed to create role" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getRoleById(id: string): Promise<ActionReturn<Role>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }
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
      return { error: "Role not found" };
    }

    return { data: parseStringify(role) };
  } catch (error) {
    console.error("Get role error:", error);
    return { error: "Failed to fetch role" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function remove(id: string): Promise<ActionReturn<Role>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }
    const role = await prisma.role.delete({
      where: {
        id,
      },
    });
    return { data: parseStringify(role) };
  } catch (error) {
    console.error("Delete role error:", error);
    return { error: "Failed to delete role" };
  } finally {
    await prisma.$disconnect();
  }
}
