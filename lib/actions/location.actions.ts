"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<DepartmentLocation>> => {
    try {
      const existingLocation = await prisma.departmentLocation.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });
      revalidatePath("/locations");
      return { success: true, data: parseStringify(existingLocation) };
    } catch (error) {
      console.error("Delete location error:", error);
      return { success: false, error: "Failed to delete location" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof locationSchema>,
  ): Promise<ActionResponse<DepartmentLocation>> => {
    try {
      const validation = locationSchema.safeParse(values);
      if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
      }
      const location = await prisma.departmentLocation.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata?.companyId!,
        },
      });
      revalidatePath("/assets/create");
      return { success: true, data: parseStringify(location) };
    } catch (error) {
      console.error("Create location error:", error);
      return { success: false, error: "Failed to create location" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<ActionResponse<DepartmentLocation[]>> => {
    try {
      const locations = await prisma.departmentLocation.findMany({
        where: {
          companyId: user.user_metadata?.companyId,
        },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: parseStringify(locations) };
    } catch (error) {
      console.error("Get locations error:", error);
      return { success: false, error: "Failed to fetch locations" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<Location>> => {
    try {
      const location = await prisma.departmentLocation.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });
      if (!location) {
        return { success: false, error: "Location not found" };
      }
      return { success: true, data: parseStringify(location) };
    } catch (error) {
      console.error("Find location error:", error);
      return { success: false, error: "Failed to fetch location" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const update = withAuth(
  async (
    user,
    id: string,
    data: Partial<DepartmentLocation>,
  ): Promise<ActionResponse<DepartmentLocation>> => {
    try {
      const {
        id: _,
        companyId: __,
        createdAt,
        updatedAt,
        ...updateData
      } = data;
      const location = await prisma.departmentLocation.update({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        data: updateData,
      });
      const paths = [`/locations`, `/locations/${id}`];
      await Promise.all(paths.map((path) => revalidatePath(path)));
      return {
        success: true,
        data: parseStringify(location),
        message: "Location updated successfully",
      };
    } catch (error) {
      console.error("[Update Location Error]:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            error: "A location with these details already exists",
          };
        }
        if (error.code === "P2025") {
          return {
            success: false,
            error: "Location not found",
          };
        }
      }
      return {
        success: false,
        error: "Failed to update location. Please try again later",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
