"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema, assetSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";
import { Asset } from "@prisma/client";

export type CreateAssetInput = {
  name: string;
  serialNumber: string;
  modelId: string;
  statusLabelId: string;
  departmentId: string;
  inventoryId: string;
  locationId: string;
  formTemplateId: string;
  templateValues?: Record<string, any>;
};

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
      const where: Prisma.AssetWhereInput = {
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
                  serialNumber: {
                    contains: options.search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      };

      const orderBy: Prisma.AssetOrderByWithRelationInput = options?.orderBy
        ? { [options.orderBy]: options.order || "asc" }
        : { name: "asc" };

      const assets = await prisma.asset.findMany({
        where,
        orderBy,
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

      return {
        success: true,
        data: assets,
      };
    } catch (error) {
      console.error("Error fetching assets:", error);
      return {
        success: false,
        error: "Failed to fetch assets",
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
  async (user, id: string, values: z.infer<typeof assetSchema>) => {
    try {
      // Skip unique validation for updates
      const existingAsset = await prisma.asset.findUnique({
        where: { id },
        select: { id: true, name: true, serialNumber: true }
      });

      if (!existingAsset) {
        return {
          success: false,
          error: "Asset not found",
        };
      }

      // Only validate uniqueness if the value has changed
      if (values.name !== existingAsset.name || values.serialNumber !== existingAsset.serialNumber) {
        const duplicateCheck = await prisma.asset.findFirst({
          where: {
            OR: [
              {
                name: values.name,
                id: { not: id },
                companyId: user.user_metadata?.companyId
              },
              {
                serialNumber: values.serialNumber,
                id: { not: id },
                companyId: user.user_metadata?.companyId
              }
            ]
          }
        });

        if (duplicateCheck) {
          return {
            success: false,
            error: "An asset with this name or serial number already exists",
          };
        }
      }

      const asset = await prisma.asset.update({
        where: { id },
        data: {
          name: values.name,
          serialNumber: values.serialNumber,
          modelId: values.modelId,
          statusLabelId: values.statusLabelId,
          departmentId: values.departmentId,
          inventoryId: values.inventoryId,
          locationId: values.locationId,
          formTemplateId: values.formTemplateId || null,
        },
      });

      // Handle form template values update
      if (values.formTemplateId && values.templateValues) {
        // Delete existing template values
        await prisma.formTemplateValue.deleteMany({
          where: { assetId: id }
        });

        // Create new template values
        const templateValues = Object.entries(values.templateValues).map(
          ([key, value]) => ({
            assetId: asset.id,
            templateId: values.formTemplateId!,
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
              action: "ASSET_UPDATED",
              entity: "Asset",
              entityId: asset.id,
              userId: dbUser.id,
              companyId: dbUser.companyId,
              details: `Updated asset ${values.name}`,
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
      console.error("Error updating asset:", error);
      return {
        success: false,
        error: "Failed to update asset",
      };
    } finally {
      await prisma.$disconnect();
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

export const processAssetsCSV = withAuth(async (user, csvContent: string) => {
  const lines = csvContent.split('\n');
  if (lines.length < 2) {
    return {
      success: false,
      message: "CSV file is empty or invalid",
    };
  }

  try {
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredHeaders = ['name', 'serialNumber', 'modelId', 'statusLabelId', 'departmentId', 'inventoryId', 'locationId'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        success: false,
        message: `Missing required columns: ${missingHeaders.join(', ')}`,
      };
    }

    // Process each line
    const assets: CreateAssetInput[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const asset: CreateAssetInput = {
        name: values[headers.indexOf('name')],
        serialNumber: values[headers.indexOf('serialNumber')],
        modelId: values[headers.indexOf('modelId')],
        statusLabelId: values[headers.indexOf('statusLabelId')],
        departmentId: values[headers.indexOf('departmentId')],
        inventoryId: values[headers.indexOf('inventoryId')],
        locationId: values[headers.indexOf('locationId')],
        formTemplateId: values[headers.indexOf('formTemplateId')] || "",
        templateValues: {}
      };

      // Add template values if they exist
      if (asset.formTemplateId && headers.includes('templateValues')) {
        try {
          const templateValuesStr = values[headers.indexOf('templateValues')];
          asset.templateValues = JSON.parse(templateValuesStr);
        } catch (e) {
          console.error(`Error parsing template values for row ${i + 1}:`, e);
        }
      }

      assets.push(asset);
    }

    // Validate and insert assets
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const asset of assets) {
      try {
        const validationResult = assetSchema.safeParse(asset);
        if (!validationResult.success) {
          errorCount++;
          errors.push(`Validation failed for asset ${asset.name}: ${validationResult.error.message}`);
          continue;
        }

        const result = await insert(asset);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          errors.push(`Failed to insert asset ${asset.name}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Error processing asset ${asset.name}: ${error}`);
      }
    }

    return {
      success: true,
      message: `Successfully imported ${successCount} assets. Failed to import ${errorCount} assets.${errors.length > 0 ? '\nErrors:\n' + errors.join('\n') : ''}`,
    };
  } catch (error) {
    console.error('Error processing CSV:', error);
    return {
      success: false,
      message: 'Failed to process CSV file: ' + (error instanceof Error ? error.message : String(error)),
    };
  }
});

export const generateAssetCSVTemplate = () => {
  const headers = [
    'name',
    'serialNumber',
    'modelId',
    'statusLabelId',
    'departmentId',
    'inventoryId',
    'locationId',
    'formTemplateId',
    'templateValues'
  ];

  const sampleRow = [
    'Sample Asset',
    'SN123456',
    'model-id',
    'status-label-id',
    'department-id',
    'inventory-id',
    'location-id',
    'form-template-id',
    '{"field1": "value1", "field2": "value2"}'
  ];

  return `${headers.join(',')}\n${sampleRow.join(',')}`;
};
