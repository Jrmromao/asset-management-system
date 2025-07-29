"use server";

import { Prisma } from "@prisma/client";
import { parseStringify } from "@/lib/utils";
import { manufacturerSchema } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/app/db";
import { withAuth } from "@/lib/middleware/withAuth";
import { cookies } from "next/headers";
import { createAuditLog } from "@/lib/actions/auditLog.actions";

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
  const result = await remove(id);
  return result;
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
      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "MANUFACTURER_CREATED",
        entity: "MANUFACTURER",
        entityId: manufacturer.id,
        details: `Manufacturer created: ${manufacturer.name} by user ${user.id}`,
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
      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "MANUFACTURER_UPDATED",
        entity: "MANUFACTURER",
        entityId: manufacturer.id,
        details: `Manufacturer updated: ${manufacturer.name} by user ${user.id}`,
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
      await createAuditLog({
        companyId: user.user_metadata?.companyId,
        action: "MANUFACTURER_DELETED",
        entity: "MANUFACTURER",
        entityId: manufacturer.id,
        details: `Manufacturer deleted: ${manufacturer.name} by user ${user.id}`,
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

export const bulkCreate = withAuth(
  async (
    user,
    manufacturers: Array<{
      name: string;
      url: string;
      supportUrl: string;
      supportPhone?: string;
      supportEmail?: string;
      active?: boolean;
    }>,
  ): Promise<ActionResponse<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
  }>> => {
    console.log(" [manufacturer.actions] bulkCreate - Starting with user:", {
      userId: user?.id,
      user_metadata: user?.user_metadata,
      hasCompanyId: !!user?.user_metadata?.companyId,
      companyId: user?.user_metadata?.companyId,
    });

    try {
      // Get companyId from user metadata
      const companyId = user.user_metadata?.companyId;

      if (!companyId) {
        console.error(
          "❌ [manufacturer.actions] bulkCreate - User missing companyId in user_metadata:",
          {
            user: user?.id,
            user_metadata: user?.user_metadata,
          },
        );
        return {
          success: false,
          data: null as any,
          error: "User is not associated with a company",
        };
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: Array<{ row: number; error: string }> = [];

      // Process each manufacturer
      for (let i = 0; i < manufacturers.length; i++) {
        const manufacturerData = manufacturers[i];
        console.log(
          `[Manufacturer Actions] Processing manufacturer ${i + 1}:`,
          manufacturerData,
        );
        
        try {
          // Validate the manufacturer data
          console.log(`[Manufacturer Actions] Validating manufacturer data:`, {
            name: manufacturerData.name,
            url: manufacturerData.url,
            supportUrl: manufacturerData.supportUrl,
            supportPhone: manufacturerData.supportPhone,
            supportEmail: manufacturerData.supportEmail,
            active: manufacturerData.active ?? true,
          });
          
          const validation = manufacturerSchema.safeParse({
            name: manufacturerData.name,
            url: manufacturerData.url,
            supportUrl: manufacturerData.supportUrl,
            supportPhone: manufacturerData.supportPhone,
            supportEmail: manufacturerData.supportEmail,
            active: manufacturerData.active ?? true,
          });

          if (!validation.success) {
            console.log(
              `[Manufacturer Actions] Validation failed for row ${i + 1}:`,
              validation.error.errors,
            );
            errors.push({
              row: i + 1,
              error: validation.error.errors[0].message,
            });
            errorCount++;
            continue;
          }

          // Check if manufacturer already exists (by name and company)
          const existingManufacturer = await prisma.manufacturer.findFirst({
            where: {
              name: manufacturerData.name,
              companyId,
            },
          });

          if (existingManufacturer) {
            console.log(
              `[Manufacturer Actions] Manufacturer "${manufacturerData.name}" already exists`,
            );
            errors.push({
              row: i + 1,
              error: `Manufacturer "${manufacturerData.name}" already exists`,
            });
            errorCount++;
            continue;
          }

          // Create the manufacturer
          const manufacturer = await prisma.manufacturer.create({
            data: {
              name: manufacturerData.name,
              url: manufacturerData.url,
              supportUrl: manufacturerData.supportUrl,
              supportPhone: manufacturerData.supportPhone || null,
              supportEmail: manufacturerData.supportEmail || null,
              active: manufacturerData.active ?? true,
              companyId,
            },
          });

          console.log(
            `[Manufacturer Actions] Successfully created manufacturer:`,
            manufacturer.name,
          );
          successCount++;

          // Create audit log
          await createAuditLog({
            companyId,
            action: "MANUFACTURER_CREATED",
            entity: "MANUFACTURER",
            entityId: manufacturer.id,
            details: `Manufacturer created via bulk import: ${manufacturer.name} by user ${user.id}`,
          });

        } catch (error) {
          console.error(
            `[Manufacturer Actions] Error processing manufacturer at row ${i + 1}:`,
            error,
          );
          errors.push({
            row: i + 1,
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
          errorCount++;
        }
      }

      console.log(
        `[Manufacturer Actions] Bulk create completed: ${successCount} successful, ${errorCount} errors`,
      );
      
      return {
        success: true,
        data: {
          successCount,
          errorCount,
          errors,
        },
      };
    } catch (error) {
      console.error(
        "❌ [manufacturer.actions] bulkCreate - Database error:",
        error,
      );
      return {
        success: false,
        data: null as any,
        error: "Failed to create manufacturers",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
