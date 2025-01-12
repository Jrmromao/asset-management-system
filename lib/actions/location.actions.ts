"use server";

import { Prisma, PrismaClient } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";

const prisma = new PrismaClient();

export async function removeCat(
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

    console.log("locations", locations);

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
  data: Location,
  id: string,
): Promise<ActionResponse<Location>> {
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
