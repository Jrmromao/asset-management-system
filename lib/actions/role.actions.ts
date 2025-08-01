"use server";

import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { prisma } from "@/app/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

async function getCompanyIdFromUser(userId: string): Promise<string | null> {
  try {
    // First, try to get from database
    const user = await prisma.user.findUnique({
      where: { oauthId: userId },
      select: { companyId: true },
    });

    if (user?.companyId) {
      return user.companyId;
    }

    // If not found in database, try from Clerk metadata
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    // Look for companyId in private metadata (more secure)
    const companyId = clerkUser.privateMetadata?.companyId as string;

    return companyId || null;
  } catch (error) {
    console.error("Error getting company ID:", error);
    return null;
  }
}

async function getCompanyIdFromOrg(orgId: string): Promise<string | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId },
      select: { id: true },
    });
    return company?.id ?? null;
  } catch (error) {
    console.error("Error getting company from org:", error);
    return null;
  }
}

export async function getAll(): Promise<AuthResponse<Role[]>> {
  try {
    console.log("🔍 [getAll] Starting role fetch...");
    const { userId, orgId } = await auth();

    console.log("🔍 [getAll] Auth result:", {
      userId: !!userId,
      orgId: !!orgId,
    });

    if (!userId) {
      return { success: false, error: "Unauthorized - No user ID" };
    }

    // Try to get company ID from user first, then from organization
    let companyId = await getCompanyIdFromUser(userId);
    console.log("🔍 [getAll] Company ID from user:", companyId);

    if (!companyId && orgId) {
      companyId = await getCompanyIdFromOrg(orgId);
      console.log("🔍 [getAll] Company ID from org:", companyId);
    }

    // TEMPORARY: If no company ID found, return mock roles for testing
    if (!companyId) {
      console.warn(
        "⚠️ [getAll] No company ID found, returning mock roles for testing",
      );
      const mockRoles = [
        {
          id: "1",
          name: "Admin",
          active: true,
          companyId: "mock",
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: false,
          isAdmin: true,
          permissions: null,
        },
        {
          id: "2",
          name: "User",
          active: true,
          companyId: "mock",
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: false,
          isAdmin: false,
          permissions: null,
        },
        {
          id: "3",
          name: "Manager",
          active: true,
          companyId: "mock",
          createdAt: new Date(),
          updatedAt: new Date(),
          isDefault: false,
          isAdmin: false,
          permissions: null,
        },
      ];
      return { success: true, data: parseStringify(mockRoles) };
    }

    console.log("🔍 [getAll] Querying roles for company:", companyId);

    // First, get company-specific roles
    const companyRoles = await prisma.role.findMany({
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

    // Get global roles (excluding Super Admin)
    const globalRoles = await prisma.role.findMany({
      where: {
        isGlobal: true,
        name: { not: "Super Admin" },
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

    // Create a map of company role names to prioritize them
    const companyRoleNames = new Set(companyRoles.map((role) => role.name));

    // Filter out global roles that have company equivalents
    const filteredGlobalRoles = globalRoles.filter(
      (role) => !companyRoleNames.has(role.name),
    );

    // Combine company roles first, then filtered global roles
    const roles = [...companyRoles, ...filteredGlobalRoles];

    console.log("✅ [getAll] Found roles:", roles.length);
    return { success: true, data: parseStringify(roles) };
  } catch (error) {
    console.error("❌ [getAll] Get roles error:", error);
    return { success: false, error: "Failed to fetch roles" };
  }
}

export async function insert(
  data: Pick<Role, "name">,
): Promise<AuthResponse<Role>> {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized - No user ID" };
    }

    // Try to get company ID from user first, then from organization
    let companyId = await getCompanyIdFromUser(userId);

    if (!companyId && orgId) {
      companyId = await getCompanyIdFromOrg(orgId);
    }

    if (!companyId) {
      return {
        success: false,
        error: "Company not found - User may need to complete onboarding",
      };
    }

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

    await createAuditLog({
      companyId: companyId,
      action: "ROLE_CREATED",
      entity: "ROLE",
      entityId: role.id,
      details: `Role created: ${role.name} by user ${userId}`,
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
    const { userId, orgId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized - No user ID" };
    }

    // Try to get company ID from user first, then from organization
    let companyId = await getCompanyIdFromUser(userId);

    if (!companyId && orgId) {
      companyId = await getCompanyIdFromOrg(orgId);
    }

    if (!companyId) {
      return {
        success: false,
        error: "Company not found - User may need to complete onboarding",
      };
    }

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
    const { userId, orgId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized - No user ID" };
    }

    // Try to get company ID from user first, then from organization
    let companyId = await getCompanyIdFromUser(userId);

    if (!companyId && orgId) {
      companyId = await getCompanyIdFromOrg(orgId);
    }

    if (!companyId) {
      return {
        success: false,
        error: "Company not found - User may need to complete onboarding",
      };
    }

    const role = await prisma.role.delete({
      where: {
        id,
        companyId: companyId,
      },
    });

    await createAuditLog({
      companyId: companyId,
      action: "ROLE_DELETED",
      entity: "ROLE",
      entityId: role.id,
      details: `Role deleted: ${role.name} by user ${userId}`,
    });

    revalidatePath("/roles");
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
    const { userId, orgId } = await auth();

    if (!userId) {
      return { success: false, error: "Unauthorized - No user ID" };
    }

    // Try to get company ID from user first, then from organization
    let companyId = await getCompanyIdFromUser(userId);

    if (!companyId && orgId) {
      companyId = await getCompanyIdFromOrg(orgId);
    }

    if (!companyId) {
      return {
        success: false,
        error: "Company not found - User may need to complete onboarding",
      };
    }

    const role = await prisma.role.update({
      where: {
        id,
        companyId: companyId,
      },
      data: {
        name: data.name,
        active: data.active,
        isDefault: data.isDefault,
        isAdmin: data.isAdmin,
      },
    });

    await createAuditLog({
      companyId: companyId,
      action: "ROLE_UPDATED",
      entity: "ROLE",
      entityId: role.id,
      details: `Role updated: ${role.name} by user ${userId}`,
    });

    revalidatePath("/roles");
    return { success: true, data: parseStringify(role) };
  } catch (error) {
    console.error("Update role error:", error);
    return { success: false, error: "Failed to update role" };
  }
}
