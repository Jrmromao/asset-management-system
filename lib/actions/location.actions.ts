"use server";

import { Prisma, PrismaClient } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function remove(
  id: string,
): Promise<ActionResponse<DepartmentLocation>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    // Check if location exists and belongs to company
    const existingLocation = await prisma.departmentLocation.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!existingLocation) {
      return { error: "Location not found" };
    }

    const location = await prisma.departmentLocation.delete({
      where: { id },
    });

    revalidatePath("/locations");
    return { data: parseStringify(location) };
  } catch (error) {
    console.error("Delete location error:", error);
    return { error: "Failed to delete location" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function insert(
  values: z.infer<typeof locationSchema>,
): Promise<ActionResponse<DepartmentLocation>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const validation = locationSchema.safeParse(values);
    if (!validation.success) {
      return { error: validation.error.errors[0].message };
    }

    const location = await prisma.departmentLocation.create({
      data: {
        ...validation.data,
        companyId: session.user.companyId!,
      },
    });

    revalidatePath("/assets/create");
    return { data: parseStringify(location) };
  } catch (error) {
    console.error("Create location error:", error);
    return { error: "Failed to create location" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAll(params?: {
  search?: string;
}): Promise<ActionResponse<DepartmentLocation[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }
    const locations = await prisma.departmentLocation.findMany({
      where: {
        companyId: session.user.companyId,
      },
      orderBy: { createdAt: "desc" },
    });

    return { data: parseStringify(locations) };
  } catch (error) {
    console.error("Get locations error:", error);
    return { error: "Failed to fetch locations" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function findById(id: string): Promise<ActionResponse<Location>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const location = await prisma.departmentLocation.findFirst({
      where: {
        id,
        companyId: session.user.companyId,
      },
    });

    if (!location) {
      return { error: "Location not found" };
    }

    return { data: parseStringify(location) };
  } catch (error) {
    console.error("Find location error:", error);
    return { error: "Failed to fetch location" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function update(
  id: string,
  data: Partial<DepartmentLocation>,
): Promise<ActionResponse<DepartmentLocation>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized: No valid session or company ID" };
    }

    const { id: _, companyId: __, createdAt, updatedAt, ...updateData } = data;

    const existingLocation = await prisma.departmentLocation.findUnique({
      where: {
        id,
        companyId: session.user.companyId,
      },
      select: { id: true, name: true },
    });

    if (!existingLocation) {
      return {
        error: "Location not found or you don't have permission to update it",
      };
    }

    // Perform update with sanitized data
    const location = await prisma.departmentLocation.update({
      where: {
        id,
        companyId: session.user.companyId,
      },
      data: updateData,
    });

    // Batch revalidations
    const paths = [`/locations`, `/locations/${id}`];
    await Promise.all(paths.map((path) => revalidatePath(path)));

    return {
      data: parseStringify(location),
      message: "Location updated successfully",
    };
  } catch (error) {
    console.error("[Update Location Error]:", error);

    // Provide more specific error messages based on error type
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "A location with these details already exists" };
      }
      if (error.code === "P2025") {
        return { error: "Location not found" };
      }
    }

    return {
      error: "Failed to update location. Please try again later",
    };
  } finally {
    await prisma.$disconnect();
  }
}
