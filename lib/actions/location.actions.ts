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

export const bulkCreate = withAuth(
  async (
    user,
    locations: Array<{
      name: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      active?: boolean;
    }>,
  ): Promise<AuthResponse<{
    successCount: number;
    errorCount: number;
    errors: Array<{ row: number; error: string }>;
  }>> => {
    console.log(" [location.actions] bulkCreate - Starting with user:", {
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
          "❌ [location.actions] bulkCreate - User missing companyId in user_metadata:",
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

      // Process each location
      for (let i = 0; i < locations.length; i++) {
        const locationData = locations[i];
        console.log(
          `[Location Actions] Processing location ${i + 1}:`,
          locationData,
        );
        
        try {
          // Validate the location data
          console.log(`[Location Actions] Validating location data:`, {
            name: locationData.name,
            addressLine1: locationData.addressLine1,
            addressLine2: locationData.addressLine2,
            city: locationData.city,
            state: locationData.state,
            zip: locationData.zip,
            country: locationData.country,
            active: locationData.active ?? true,
          });
          
          const validation = locationSchema.safeParse({
            name: locationData.name,
            addressLine1: locationData.addressLine1,
            addressLine2: locationData.addressLine2,
            city: locationData.city,
            state: locationData.state,
            zip: locationData.zip,
            country: locationData.country,
            active: locationData.active ?? true,
          });

          if (!validation.success) {
            console.log(
              `[Location Actions] Validation failed for row ${i + 1}:`,
              validation.error.errors,
            );
            errors.push({
              row: i + 1,
              error: validation.error.errors[0].message,
            });
            errorCount++;
            continue;
          }

          // Check if location already exists (by name and company)
          const existingLocation = await prisma.departmentLocation.findFirst({
            where: {
              name: locationData.name,
              companyId,
            },
          });

          if (existingLocation) {
            console.log(
              `[Location Actions] Location "${locationData.name}" already exists`,
            );
            errors.push({
              row: i + 1,
              error: `Location "${locationData.name}" already exists`,
            });
            errorCount++;
            continue;
          }

          // Create the location
          const location = await prisma.departmentLocation.create({
            data: {
              name: locationData.name,
              addressLine1: locationData.addressLine1,
              addressLine2: locationData.addressLine2,
              city: locationData.city,
              state: locationData.state,
              zip: locationData.zip,
              country: locationData.country,
              active: locationData.active ?? true,
              companyId,
            },
          });

          console.log(
            `[Location Actions] Successfully created location:`,
            location.name,
          );
          successCount++;

          // Create audit log
          await createAuditLog({
            companyId,
            action: "LOCATION_CREATED",
            entity: "LOCATION",
            entityId: location.id,
            details: `Location created via bulk import: ${location.name} by user ${user.id}`,
          });

        } catch (error) {
          console.error(
            `[Location Actions] Error processing location at row ${i + 1}:`,
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
        `[Location Actions] Bulk create completed: ${successCount} successful, ${errorCount} errors`,
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
        "❌ [location.actions] bulkCreate - Database error:",
        error,
      );
      return {
        success: false,
        data: null as any,
        error: "Failed to create locations",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);
