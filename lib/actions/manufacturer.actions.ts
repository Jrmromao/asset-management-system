"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { manufacturerSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";

type ActionResponse<T> = {
  data: T | undefined;
  error?: string;
  success: boolean;
};

// Client-side wrapper functions
export async function getAllManufacturers(params?: { search?: string }) {
  const cookieStore = await cookies();
  const session = {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
  return await getAll();
}

export async function createManufacturer(
  data: z.infer<typeof manufacturerSchema>,
) {
  return await insert(data);
}

export async function updateManufacturer(
  id: string,
  data: Partial<z.infer<typeof manufacturerSchema>>,
) {
  const cookieStore = await cookies();
  const session = {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
  return await update(id, data);
}

export async function deleteManufacturer(id: string) {
  return await remove(id);
}

// Server actions with auth
export const getAll = withAuth(
  async (
    user,
    params?: { search?: string },
  ): Promise<ActionResponse<Manufacturer[]>> => {
    try {
      const where: Prisma.ManufacturerWhereInput = {
        companyId: user.user_metadata?.companyId,
        ...(params?.search && {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { supportEmail: { contains: params.search, mode: "insensitive" } },
          ],
        }),
      };
      const manufacturers = await prisma.manufacturer.findMany({
        where,
        include: {
          _count: {
            select: { models: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data: parseStringify(manufacturers) };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch manufacturers",
        data: [],
      };
    }
  },
);

export const insert = withAuth(
  async (
    user,
    values: z.infer<typeof manufacturerSchema>,
  ): Promise<ActionResponse<Manufacturer>> => {
    try {
      const validation = manufacturerSchema.safeParse(values);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0].message,
          data: undefined,
        };
      }
      const manufacturer = await prisma.manufacturer.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata?.companyId,
          supportPhone: values.supportPhone || null,
          supportEmail: values.supportEmail || null,
        },
      });
      revalidatePath("/assets/create");
      return { success: true, data: parseStringify(manufacturer) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            error: "A manufacturer with this name already exists",
            data: undefined,
          };
        }
      }
      return {
        success: false,
        error: "Failed to create manufacturer",
        data: undefined,
      };
    }
  },
);

export const findById = withAuth(
  async (user, id: string): Promise<ActionResponse<Manufacturer>> => {
    try {
      const manufacturer = await prisma.manufacturer.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        include: {
          models: {
            select: {
              id: true,
              name: true,
              modelNo: true,
            },
          },
        },
      });
      if (!manufacturer) {
        return {
          success: false,
          error: "Manufacturer not found",
          data: undefined,
        };
      }
      return { success: true, data: parseStringify(manufacturer) };
    } catch (error) {
      return {
        success: false,
        error: "Failed to fetch manufacturer",
        data: undefined,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const update = withAuth(
  async (
    user,
    id: string,
    values: Partial<z.infer<typeof manufacturerSchema>>,
  ): Promise<ActionResponse<Manufacturer>> => {
    try {
      const validation = manufacturerSchema.partial().safeParse(values);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error.errors[0].message,
          data: undefined,
        };
      }
      const existingManufacturer = await prisma.manufacturer.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });
      if (!existingManufacturer) {
        return {
          success: false,
          error: "Manufacturer not found",
          data: undefined,
        };
      }
      const manufacturer = await prisma.manufacturer.update({
        where: { id },
        data: {
          ...validation.data,
          supportPhone: values.supportPhone || null,
          supportEmail: values.supportEmail || null,
        },
      });
      revalidatePath("/manufacturers");
      revalidatePath(`/manufacturers/${id}`);
      return { success: true, data: parseStringify(manufacturer) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            error: "A manufacturer with this name already exists",
            data: undefined,
          };
        }
      }
      return {
        success: false,
        error: "Failed to update manufacturer",
        data: undefined,
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(
  async (user, id: string): Promise<ActionResponse<Manufacturer>> => {
    try {
      const existingManufacturer = await prisma.manufacturer.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        include: {
          models: {
            select: { id: true },
            take: 1,
          },
        },
      });
      if (!existingManufacturer) {
        return {
          success: false,
          error: "Manufacturer not found",
          data: undefined,
        };
      }
      if (existingManufacturer.models.length > 0) {
        return {
          success: false,
          error: "Cannot delete manufacturer with associated models",
          data: undefined,
        };
      }
      const manufacturer = await prisma.manufacturer.delete({
        where: { id },
      });
      revalidatePath("/manufacturers");
      return { success: true, data: parseStringify(manufacturer) };
    } catch (error) {
      return {
        success: false,
        error: "Failed to delete manufacturer",
        data: undefined,
      };
    }
  },
);

export const isManufacturerNameUnique = withAuth(
  async (
    user,
    name: string,
    excludeId?: string,
  ): Promise<ActionResponse<boolean>> => {
    try {
      const manufacturer = await prisma.manufacturer.findFirst({
        where: {
          name,
          companyId: user.user_metadata?.companyId,
          id: excludeId ? { not: excludeId } : undefined,
        },
        select: { id: true },
      });
      return { success: true, data: !manufacturer };
    } catch (error) {
      return {
        success: false,
        error: "Failed to check manufacturer name",
        data: false,
      };
    }
  },
);
