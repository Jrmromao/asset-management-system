"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema, assetSchema } from "@/lib/schemas";
import { Prisma, Asset } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";

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

type AuthResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

async function findUserByOauthId(oauthId: string) {
  return prisma.user.findFirst({ where: { oauthId } });
}

export const create = withAuth(async (user, data: CreateAssetInput): Promise<AuthResponse<Asset>> => {
  try {
    const validation = assetSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message,
      };
    }

    const asset = await prisma.asset.create({
      data: {
        ...validation.data,
        companyId: user.user_metadata?.companyId,
      },
      include: {
        model: true,
        assignee: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });

    revalidatePath("/assets");
    return { success: true, data: parseStringify(asset) };
  } catch (error) {
    console.error("Create asset error:", error);
    return { success: false, error: "Failed to create asset" };
  } finally {
    await prisma.$disconnect();
  }
});

export const getAll = withAuth(async (user): Promise<AuthResponse<Asset[]>> => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        companyId: user.user_metadata?.companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        model: true,
        assignee: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });
    return { success: true, data: parseStringify(assets) };
  } catch (error) {
    console.error("Get assets error:", error);
    return { success: false, error: "Failed to fetch assets" };
  } finally {
    await prisma.$disconnect();
  }
});

export const getAssetById = withAuth(async (user, id: string): Promise<AuthResponse<Asset>> => {
  try {
    const asset = await prisma.asset.findFirst({
      where: {
        id,
        companyId: user.user_metadata?.companyId,
      },
      include: {
        model: true,
        assignee: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });
    if (!asset) {
      return { success: false, error: "Asset not found" };
    }
    return { success: true, data: parseStringify(asset) };
  } catch (error) {
    console.error("Get asset error:", error);
    return { success: false, error: "Failed to fetch asset" };
  } finally {
    await prisma.$disconnect();
  }
});

export const remove = withAuth(async (user, id: string): Promise<AuthResponse<Asset>> => {
  try {
    const asset = await prisma.asset.delete({
      where: { 
        id,
        companyId: user.user_metadata?.companyId,
      },
    });
    revalidatePath("/assets");
    return { success: true, data: parseStringify(asset) };
  } catch (error) {
    console.error("Delete asset error:", error);
    return { success: false, error: "Failed to delete asset" };
  } finally {
    await prisma.$disconnect();
  }
});

export const update = withAuth(async (user, id: string, data: CreateAssetInput): Promise<AuthResponse<Asset>> => {
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
    if (data.name !== existingAsset.name || data.serialNumber !== existingAsset.serialNumber) {
      const duplicateCheck = await prisma.asset.findFirst({
        where: {
          OR: [
            {
              name: data.name,
              id: { not: id },
              companyId: user.user_metadata?.companyId
            },
            {
              serialNumber: data.serialNumber,
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
        ...data,
      },
      include: {
        model: true,
        assignee: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });

    // Handle form template values update
    if (data.formTemplateId && data.templateValues) {
      // Delete existing template values
      await prisma.formTemplateValue.deleteMany({
        where: { assetId: id }
      });

      // Create new template values
      const templateValues = Object.entries(data.templateValues).map(
        ([key, value]) => ({
          assetId: asset.id,
          templateId: data.formTemplateId!,
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
            details: `Updated asset ${data.name}`,
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
});

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

        const result = await create(asset);
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

export const exportToCSV = withAuth(async (user) => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
        companyId: user.user_metadata?.companyId,
      },
      select: {
        name: true,
        serialNumber: true,
        model: {
          select: {
            name: true,
          }
        },
        statusLabel: {
          select: {
            name: true,
          }
        },
        department: {
          select: {
            name: true,
          }
        },
        departmentLocation: {
          select: {
            name: true,
          }
        },
        inventory: {
          select: {
            name: true,
          }
        },
        datePurchased: true,
        price: true,
        poNumber: true,
        supplier: {
          select: {
            name: true,
          }
        },
        formTemplate: {
          select: {
            name: true,
          }
        },
        formTemplateValues: {
          select: {
            values: true,
          }
        },
        assignee: {
          select: {
            name: true,
          }
        },
        energyRating: true,
        dailyOperatingHours: true,
        weight: true,
      },
    });

    // Convert assets to CSV format
    const headers = [
      'Name',
      'Serial Number',
      'Model',
      'Status',
      'Department',
      'Location',
      'Inventory',
      'Purchase Date',
      'Purchase Price',
      'PO Number',
      'Supplier',
      'Form Template',
      'Template Values',
      'Assigned To',
      'Energy Rating',
      'Daily Operating Hours',
      'Weight (kg)'
    ];

    const rows = assets.map(asset => [
      asset.name,
      asset.serialNumber,
      asset.model?.name || '',
      asset.statusLabel?.name || '',
      asset.department?.name || '',
      asset.departmentLocation?.name || '',
      asset.inventory?.name || '',
      asset.datePurchased ? new Date(asset.datePurchased).toISOString().split('T')[0] : '',
      asset.price?.toString() || '',
      asset.poNumber || '',
      asset.supplier?.name || '',
      asset.formTemplate?.name || '',
      JSON.stringify(asset.formTemplateValues?.[0]?.values || {}),
      asset.assignee?.name || '',
      asset.energyRating || '',
      asset.dailyOperatingHours?.toString() || '',
      asset.weight?.toString() || ''
    ]);

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell?.replace(/"/g, '""') || ''}"`.trim()).join(','))
    ].join('\n');

    return {
      success: true,
      data: csvContent
    };
  } catch (error) {
    console.error("[EXPORT_ASSETS_TO_CSV]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export assets"
    };
  }
});

