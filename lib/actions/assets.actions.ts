"use server";

import { prisma } from "@/app/db";
import { z } from "zod";
import { categorySchema, assetSchema } from "@/lib/schemas";
import { Prisma, Asset } from "@prisma/client";
import { withAuth } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";
import { cookies } from 'next/headers';

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

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get('sb-access-token')?.value,
    refreshToken: cookieStore.get('sb-refresh-token')?.value
  };
};

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

// Wrap the create function to handle session
export async function createAsset(data: CreateAssetInput): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return create(session, data);
}

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

// Wrap the getAll function to handle session
export async function getAllAssets(): Promise<AuthResponse<Asset[]>> {
  const session = getSession();
  return getAll(session);
}

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

// Wrap the getAssetById function to handle session
export async function getAsset(id: string): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return getAssetById(session, id);
}

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

// Wrap the remove function to handle session
export async function removeAsset(id: string): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return remove(session, id);
}

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

    revalidatePath("/assets");
    return { success: true, data: parseStringify(asset) };
  } catch (error) {
    console.error("Update asset error:", error);
    return { success: false, error: "Failed to update asset" };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrap the update function to handle session
export async function updateAsset(id: string, data: CreateAssetInput): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return update(session, id, data);
}

export const findById = withAuth(async (user, id: string): Promise<AuthResponse<Asset>> => {
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
    console.error("Find asset error:", error);
    return { success: false, error: "Failed to find asset" };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrap the findById function to handle session
export async function findAssetById(id: string): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return findById(session, id);
}

export const checkin = withAuth(async (user, id: string): Promise<AuthResponse<Asset>> => {
  try {
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        assigneeId: null,
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
    console.error("Checkin asset error:", error);
    return { success: false, error: "Failed to check in asset" };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrap the checkin function to handle session
export async function checkinAsset(id: string): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return checkin(session, id);
}

export const checkout = withAuth(async (user, id: string, assigneeId: string): Promise<AuthResponse<Asset>> => {
  try {
    const asset = await prisma.asset.update({
      where: { id },
      data: {
        assigneeId,
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
    console.error("Checkout asset error:", error);
    return { success: false, error: "Failed to check out asset" };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrap the checkout function to handle session
export async function checkoutAsset(id: string, assigneeId: string): Promise<AuthResponse<Asset>> {
  const session = getSession();
  return checkout(session, id, assigneeId);
}

export const processAssetsCSV = withAuth(async (user, csvContent: string): Promise<AuthResponse<{ success: boolean; message: string }>> => {
  try {
    // Process CSV content
    const rows = csvContent.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1);

    // Validate headers
    const requiredHeaders = ['name', 'serialNumber', 'modelId', 'statusLabelId'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Missing required headers: ${missingHeaders.join(', ')}`,
      };
    }

    // Process each row
    for (const row of data) {
      const assetData = headers.reduce((acc, header, index) => {
        acc[header.trim()] = row[index]?.trim();
        return acc;
      }, {} as Record<string, string>);

      // Validate required fields
      const validation = assetSchema.safeParse(assetData);
      if (!validation.success) {
        continue;
      }

      await prisma.asset.create({
        data: {
          ...validation.data,
          companyId: user.user_metadata?.companyId,
        },
      });
    }

    revalidatePath("/assets");
    return {
      success: true,
      data: { success: true, message: "CSV processed successfully" },
    };
  } catch (error) {
    console.error("Process CSV error:", error);
    return {
      success: false,
      error: "Failed to process CSV file",
    };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrap the processAssetsCSV function to handle session
export async function processAssetCSV(csvContent: string): Promise<AuthResponse<{ success: boolean; message: string }>> {
  const session = getSession();
  return processAssetsCSV(session, csvContent);
}

export const generateAssetCSVTemplate = withAuth(async (user): Promise<AuthResponse<string>> => {
  try {
    const headers = [
      'name',
      'serialNumber',
      'modelId',
      'statusLabelId',
      'departmentId',
      'inventoryId',
      'locationId',
    ];

    return {
      success: true,
      data: headers.join(','),
    };
  } catch (error) {
    console.error("Generate CSV template error:", error);
    return {
      success: false,
      error: "Failed to generate CSV template",
    };
  }
});

// Wrap the generateAssetCSVTemplate function to handle session
export async function generateCSVTemplate(): Promise<AuthResponse<string>> {
  const session = getSession();
  return generateAssetCSVTemplate(session);
}

export const exportToCSV = withAuth(async (user): Promise<AuthResponse<string>> => {
  try {
    const assets = await prisma.asset.findMany({
      where: {
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

    const headers = [
      'name',
      'serialNumber',
      'modelId',
      'statusLabelId',
      'departmentId',
      'inventoryId',
      'locationId',
    ];

    const rows = assets.map(asset => [
      asset.name,
      asset.serialNumber,
      asset.modelId,
      asset.statusLabelId,
      asset.departmentId,
      asset.inventoryId,
      asset.departmentLocationId,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return {
      success: true,
      data: csvContent,
    };
  } catch (error) {
    console.error("Export to CSV error:", error);
    return {
      success: false,
      error: "Failed to export assets to CSV",
    };
  } finally {
    await prisma.$disconnect();
  }
});

// Wrap the exportToCSV function to handle session
export async function exportAssetsToCSV(): Promise<AuthResponse<string>> {
  const session = getSession();
  return exportToCSV(session);
}

