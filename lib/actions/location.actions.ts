"use server";

import { Prisma, PrismaClient } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

type ActionReturn<T> = {
  data?: T;
  error?: string;
};

export async function insert(
  values: z.infer<typeof locationSchema>,
): Promise<ActionResponse<Location>> {
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
}): Promise<ActionReturn<Location[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const where: Prisma.DepartmentLocationWhereInput = {
      companyId: session.user.companyId!,
      ...(params?.search && {
        OR: [
          {
            name: {
              contains: params.search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            city: {
              contains: params.search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
          {
            state: {
              contains: params.search,
              mode: "insensitive" as Prisma.QueryMode,
            },
          },
        ],
      }),
    };

    const locations = await prisma.departmentLocation.findMany({
      where,
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

// Alternative simpler version without case-insensitive search if your DB doesn't support it
export async function getAllSimple(params?: {
  search?: string;
}): Promise<ActionReturn<Location[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const where: Prisma.DepartmentLocationWhereInput = {
      companyId: session.user.companyId,
      ...(params?.search && {
        OR: [
          { name: { contains: params.search } },
          { city: { contains: params.search } },
          { state: { contains: params.search } },
        ],
      }),
    };

    const locations = await prisma.departmentLocation.findMany({
      where,
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

// If you need a version with exact matches:
export async function getAllExact(params?: {
  search?: string;
}): Promise<ActionReturn<Location[]>> {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Not authenticated" };
    }

    const where: Prisma.DepartmentLocationWhereInput = {
      companyId: session.user.companyId,
      ...(params?.search && {
        OR: [
          { name: { equals: params.search } },
          { city: { equals: params.search } },
          { state: { equals: params.search } },
        ],
      }),
    };

    const locations = await prisma.departmentLocation.findMany({
      where,
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

export async function findById(id: string): Promise<ActionReturn<Location>> {
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
  data: Location,
  id: string,
): Promise<ActionReturn<Location>> {
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

    const location = await prisma.departmentLocation.update({
      where: { id },
      data: {
        ...data,
        companyId: session.user.companyId, // Ensure companyId doesn't change
      },
    });

    revalidatePath("/locations");
    revalidatePath(`/locations/${id}`);
    return { data: parseStringify(location) };
  } catch (error) {
    console.error("Update location error:", error);
    return { error: "Failed to update location" };
  } finally {
    await prisma.$disconnect();
  }
}

export async function remove(id: string): Promise<ActionReturn<Location>> {
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

    // Optional: Check for related records before deletion
    // const hasRelatedRecords = await prisma.asset.findFirst({
    //   where: { locationId: id },
    //   select: { id: true },
    // });
    //
    // if (hasRelatedRecords) {
    //   return { error: "Cannot delete location with associated assets" };
    // }

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

// Utility function to check if location name is unique in company
export async function isLocationNameUnique(
  name: string,
  excludeId?: string,
): Promise<boolean> {
  try {
    const session = await auth();
    if (!session) return false;

    const existingLocation = await prisma.departmentLocation.findFirst({
      where: {
        name,
        companyId: session.user.companyId,
        id: excludeId ? { not: excludeId } : undefined,
      },
      select: { id: true },
    });

    return !existingLocation;
  } catch (error) {
    console.error("Check location name error:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
