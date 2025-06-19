"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema, assetSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";

async function findUserByOauthId(oauthId: string) {
  return prisma.user.findFirst({ where: { oauthId } });
}

export const insert = withAuth(
  async (user, values: z.infer<typeof assetSchema>) => {
    try {
      const validation = await assetSchema.safeParseAsync(values);

      if (!validation.success) {
        return {
          success: false,
          error: "Invalid input data",
        };
      }

      const asset = await prisma.asset.create({
        data: {
          name: validation.data.name,
          serialNumber: validation.data.serialNumber,
          modelId: validation.data.modelId,
          statusLabelId: validation.data.statusLabelId,
          departmentId: validation.data.departmentId,
          inventoryId: validation.data.inventoryId,
          locationId: validation.data.locationId,
          formTemplateId: validation.data.formTemplateId || null,
          companyId: user.user_metadata?.companyId,
          status: "Available",
        },
      });

      // If form template values are provided, create them
      if (validation.data.formTemplateId && validation.data.templateValues) {
        const templateValues = Object.entries(validation.data.templateValues).map(
          ([key, value]) => ({
            assetId: asset.id,
            templateId: validation.data.formTemplateId!,
            values: { [key]: value },
          })
        );

        if (templateValues.length > 0) {
          await prisma.formTemplateValue.createMany({
            data: templateValues,
          });
        }
      }

      // Create audit log
      try {
        const dbUser = await findUserByOauthId(user.id);
        if (dbUser) {
          await prisma.auditLog.create({
            data: {
              action: "ASSET_CREATED",
              entity: "Asset",
              entityId: asset.id,
              userId: dbUser.id,
              companyId: dbUser.companyId,
              details: `Created asset ${validation.data.name} with serial number ${validation.data.serialNumber}`,
            },
          });
        } else {
          console.warn("No matching app user found for audit log. Skipping audit log creation.");
        }
      } catch (e) {
        console.error("Failed to create audit log:", e);
      }

      return {
        success: true,
        data: asset,
      };
    } catch (error) {
      console.error("Error creating asset:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            success: false,
            error: "An asset with this serial number or name already exists",
          };
        }
      }

      return {
        success: false,
        error: "Failed to create asset",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const getAll = withAuth(
  async (
    user,
    options?: {
      orderBy?: "name" | "createdAt";
      order?: "asc" | "desc";
      search?: string;
    },
  ) => {
    try {
      const where: Prisma.CategoryWhereInput = {
        companyId: user.user_metadata?.companyId,
        ...(options?.search
          ? {
              OR: [
                {
                  name: {
                    contains: options.search,
                    mode: "insensitive",
                  },
                },
                {
                  type: {
                    contains: options.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      };

      const orderBy: Prisma.CategoryOrderByWithRelationInput = options?.orderBy
        ? { [options.orderBy]: options.order || "asc" }
        : { name: "asc" };

      const categories = await prisma.category.findMany({
        where,
        orderBy,
        select: {
          id: true,
          name: true,
          type: true,
          companyId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        data: categories,
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return {
        success: false,
        error: "Failed to fetch categories",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export const remove = withAuth(async (user, id: string) => {
  try {
    const category = await prisma.category.delete({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
      select: {
        id: true,
        name: true,
        type: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Error removing category:", error);
    return {
      success: false,
      error: "Failed to remove category",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const update = withAuth(
  async (user, id: string, data: Partial<Asset>) => {
    try {
      const asset = await prisma.asset.update({
        where: {
          id: id,
          companyId: user.user_metadata?.companyId,
        },
        data: data as Prisma.AssetUpdateInput,
      });

      return {
        success: true,
        data: asset,
      };
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  },
);

export const findById = withAuth(async (user, id: string) => {
  try {
    // Disconnect any existing connections
    await prisma.$disconnect();
    
    console.log('Finding asset with id:', id);
    console.log('User company ID:', user.user_metadata?.companyId);
    console.log('Timestamp:', new Date().toISOString());
    
    // Create a new connection
    await prisma.$connect();
    
    const asset = await prisma.asset.findFirst({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
        AND: {
          updatedAt: {
            lte: new Date()
          }
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
          },
        },
        model: true,
        statusLabel: true,
        department: true,
        departmentLocation: true,
        formTemplate: {
          include: {
            values: true,
          },
        },
        formTemplateValues: true,
        AssetHistory: true,
        Co2eRecord: true,
      },
    });

    console.log('Found asset:', asset);

    // Fetch audit logs separately since they're not directly related to Asset
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityId: id,
        entity: 'Asset',
        companyId: user.user_metadata?.companyId,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found audit logs:', auditLogs.length);

    return {
      success: true,
      data: asset ? {
        ...asset,
        auditLogs,
      } : null,
    };
  } catch (error) {
    console.error("Error finding asset:", error);
    return {
      success: false,
      error: "Failed to find asset",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const checkin = withAuth(async (user, id: string) => {
  try {
    const asset = await prisma.asset.update({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
      data: {
        status: "CHECKED_IN",
      },
    });
    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    console.error("Error checking in asset:", error);
    return {
      success: false,
      error: "Failed to check in asset",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const checkout = withAuth(async (user, id: string) => {
  try {
    const asset = await prisma.asset.update({
      where: {
        id: id,
        companyId: user.user_metadata?.companyId,
      },
      data: {
        status: "CHECKED_OUT",
      },
    });
    return {
      success: true,
      data: asset,
    };
  } catch (error) {
    console.error("Error checking out asset:", error);
    return {
      success: false,
      error: "Failed to check out asset",
    };
  } finally {
    await prisma.$disconnect();
  }
});
