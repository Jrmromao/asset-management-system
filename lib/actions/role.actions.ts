"use server";

import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { auth } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

async function getCompanyId(orgId: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { clerkOrgId: orgId },
    select: { id: true },
  });
  return company?.id ?? null;
}

export async function getAll(): Promise<AuthResponse<Role[]>> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: "Unauthorized" };

    const companyId = await getCompanyId(orgId);
    if (!companyId) return { success: false, error: "Company not found" };

    const roles = await prisma.role.findMany({
      where: {
        companyId: companyId,
      },
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
  }
}

export async function insert(
  data: Pick<Role, "name">,
): Promise<AuthResponse<Role>> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: "Unauthorized" };

    const companyId = await getCompanyId(orgId);
    if (!companyId) return { success: false, error: "Company not found" };

    const existingRole = await prisma.role.findFirst({
      where: {
        name: data.name,
        companyId: companyId,
      },
    });
    if (existingRole) {
      return { success: false, error: "Role with this name already exists" };
    }
    const role = await prisma.role.create({
      data: {
        name: data.name,
        companyId: companyId,
      },
    });
    revalidatePath("/roles");
    return { success: true, data: parseStringify(role) };
  } catch (error) {
    console.error("Create role error:", error);
    return { success: false, error: "Failed to create role" };
  }
}

export async function getRoleById(id: string): Promise<AuthResponse<Role>> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: "Unauthorized" };

    const companyId = await getCompanyId(orgId);
    if (!companyId) return { success: false, error: "Company not found" };

    const role = await prisma.role.findFirst({
      where: {
        id,
        companyId: companyId,
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
  }
}

export async function remove(id: string): Promise<AuthResponse<Role>> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: "Unauthorized" };

    const companyId = await getCompanyId(orgId);
    if (!companyId) return { success: false, error: "Company not found" };

    const role = await prisma.role.delete({
      where: {
        id,
        companyId: companyId,
      },
    });
    return { success: true, data: parseStringify(role) };
  } catch (error) {
    console.error("Delete role error:", error);
    return { success: false, error: "Failed to delete role" };
  }
}

export async function update(
  id: string,
  data: Partial<Role>,
): Promise<AuthResponse<Role>> {
  try {
    const { orgId } = await auth();
    if (!orgId) return { success: false, error: "Unauthorized" };

    const companyId = await getCompanyId(orgId);
    if (!companyId) return { success: false, error: "Company not found" };

    const role = await prisma.role.update({
      where: {
        id,
        companyId: companyId,
      },
      data,
    });
    return { success: true, data: parseStringify(role) };
  } catch (error) {
    console.error("Update role error:", error);
    return { success: false, error: "Failed to update role" };
  }
}
