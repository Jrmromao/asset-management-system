"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";
import { withAuth, type AuthResponse } from "@/lib/middleware/withAuth";
import type { DepartmentLocation } from "@prisma/client";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof locationSchema>,
  ): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      const validation = locationSchema.safeParse(values);
      if (!validation.success) {
        return {
          success: false,
          data: null as any,
          error: validation.error.errors[0].message,
        };
      }

      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const location = await prisma.departmentLocation.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata.companyId,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "LOCATION_CREATED",
        entity: "LOCATION",
        entityId: location.id,
        details: `Location created: ${location.name} by user ${user.id}`,
      });

      // Fix: Revalidate correct paths
      revalidatePath("/locations");
      return { success: true, data: parseStringify(location) };
    } catch (error) {
      // Add duplicate handling like update action
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            data: null as any,
            error: "A location with this name already exists in your company",
          };
        }
      }
      console.error("Create location error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to create location",
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
  ): Promise<AuthResponse<DepartmentLocation[]>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
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
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch locations",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const location = await prisma.departmentLocation.findFirst({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });
      if (!location) {
        return {
          success: false,
          data: null as any,
          error: "Location not found",
        };
      }
      return { success: true, data: parseStringify(location) };
    } catch (error) {
      console.error("Find location error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to fetch location",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const existingLocation = await prisma.departmentLocation.delete({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
      });

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "LOCATION_DELETED",
        entity: "LOCATION",
        entityId: existingLocation.id,
        details: `Location deleted: ${existingLocation.name} by user ${user.id}`,
      });

      revalidatePath("/locations");
      return { success: true, data: parseStringify(existingLocation) };
    } catch (error) {
      console.error("Delete location error:", error);
      return {
        success: false,
        data: null as any,
        error: "Failed to delete location",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

type CreateLocationInput = z.infer<typeof locationSchema>;

export const update = withAuth(
  async (
    user,
    id: string,
    data: z.infer<typeof locationSchema>,
  ): Promise<AuthResponse<DepartmentLocation>> => {
    try {
      // Check if user has a companyId
      if (!user.user_metadata?.companyId) {
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      const location = await prisma.departmentLocation.update({
        where: {
          id,
          companyId: user.user_metadata.companyId,
        },
        data,
      });

      await createAuditLog({
        companyId: user.user_metadata.companyId,
        action: "LOCATION_UPDATED",
        entity: "LOCATION",
        entityId: location.id,
        details: `Location updated: ${location.name} by user ${user.id}`,
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
