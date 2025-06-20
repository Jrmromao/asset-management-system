"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import type { DepartmentLocation } from "@prisma/client";

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
    values: z.infer<typeof locationSchema>,
  ): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      const validation = locationSchema.safeParse(values);
      if (!validation.success) {
        return { success: false, data: null as any, error: validation.error.errors[0].message };
      }
      
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const location = await prisma.departmentLocation.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata.companyId,
        },
      });
      revalidatePath("/assets/create");
      return { success: true, data: parseStringify(location) };
    } catch (error) {
      console.error("Create location error:", error);
      return { success: false, data: null as any, error: "Failed to create location" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function createLocation(
  values: z.infer<typeof locationSchema>,
): Promise<AuthResponse<DepartmentLocation>> {
  const session = getSession();
  return insert(values);
}

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<AuthResponse<DepartmentLocation[]>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const locations = await prisma.departmentLocation.findMany({
        where: {
          companyId: user.user_metadata.companyId,
        },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: parseStringify(locations) };
    } catch (error) {
      console.error("Get locations error:", error);
      return { success: false, data: null as any, error: "Failed to fetch locations" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getAllLocations(params?: {
  search?: string;
}): Promise<AuthResponse<DepartmentLocation[]>> {
  const session = getSession();
  return getAll(params);
}

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const location = await prisma.departmentLocation.findFirst({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });
      if (!location) {
        return { success: false, data: null as any, error: "Location not found" };
      }
      return { success: true, data: parseStringify(location) };
    } catch (error) {
      console.error("Find location error:", error);
      return { success: false, data: null as any, error: "Failed to fetch location" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function getLocation(
  id: string,
): Promise<AuthResponse<DepartmentLocation>> {
  const session = getSession();
  return findById(id);
}

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const existingLocation = await prisma.departmentLocation.delete({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });
      revalidatePath("/locations");
      return { success: true, data: parseStringify(existingLocation) };
    } catch (error) {
      console.error("Delete location error:", error);
      return { success: false, data: null as any, error: "Failed to delete location" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function deleteLocation(
  id: string,
): Promise<AuthResponse<DepartmentLocation>> {
  const session = getSession();
  return remove(id);
}

type CreateLocationInput = z.infer<typeof locationSchema>;

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<CreateLocationInput>,
  ): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return { success: false, data: null as any, error: "User is not associated with a company" };
      }
      
      const location = await prisma.departmentLocation.update({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
        data,
      });
      const paths = [`/locations`, `/locations/${id}`];
      await Promise.all(paths.map((path) => revalidatePath(path)));
      return {
        success: true,
        data: parseStringify(location),
      };
    } catch (error) {
      console.error("[Update Location Error]:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "A location with these details already exists",
          };
        }
        if (error.code === "P2025") {
          return {
            success: false,
            data: null as any,
            error: "Location not found",
          };
        }
      }
      return {
        success: false,
        data: null as any,
        error: "Failed to update location. Please try again later",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

// Wrapper function for client-side use
export async function updateLocation(
  id: string,
  data: Partial<CreateLocationInput>,
): Promise<AuthResponse<DepartmentLocation>> {
  const session = getSession();
  return update(id, data);
}