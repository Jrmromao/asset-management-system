"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents, roundFloat } from "@/lib/utils";
import { auth } from "@/auth";
import { z } from "zod";
import { assetSchema, assignmentSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

// Common include object for consistent asset queries
const assetIncludes = {
  // license: true,
  model: {
    include: {
      manufacturer: true,
      category: true,
    },
  },
  department: true,
  departmentLocation: true,
  company: true,
  statusLabel: true,
  assignee: true,
  formTemplateValues: true,
  formTemplate: true,
  AssetHistory: true,
} as const;

// Type for the API response
type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export async function create(
  values: z.infer<typeof assetSchema>,
): Promise<ApiResponse<Asset>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized access" };
    }

    const validation = assetSchema.safeParse(values);
    if (!validation.success) {
      console.error("Validation errors:", validation.error.errors);
      return { error: validation.error.errors[0].message };
    }

    const newAsset = await prisma.asset.create({
      data: {
        name: values.name,
        serialNumber: values.serialNumber,
        material: values.material || "",
        modelId: values.modelId,
        endOfLife: values.endOfLife!,
        licenseId: "cm559xnyw0001r7l4yhxbyncx",
        statusLabelId: values.statusLabelId,
        supplierId: values.supplierId,
        companyId: session.user.companyId,
        locationId: values.locationId,
        departmentId: values.departmentId,
        weight: values.weight || 90,
        price: values.price,
        poNumber: values.poNumber,
        datePurchased: values.purchaseDate || new Date(),
        inventoryId: values.inventoryId,
        energyRating: values.energyRating || "",
        dailyOperatingHours: Number(values.dailyOperatingHours),
        formTemplateId: values.formTemplateId,
      },
      include: assetIncludes,
    });

    if (!newAsset) {
      return { error: "Failed to create asset" };
    }

    if (values.formTemplateId && values.templateValues) {
      await prisma.formTemplateValue.createMany({
        data: {
          assetId: newAsset.id,
          templateId: values.formTemplateId!,
          values: values.templateValues,
        },
      });
    }

    return { data: parseStringify(newAsset) };
  } catch (error) {
    console.error("Error creating asset:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { error: "Serial number already exists" };
      }
    }
    return { error: "Failed to create asset" };
  }
}

export async function get(): Promise<ApiResponse<Asset[]>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized access" };
    }

    const assets = await prisma.asset.findMany({
      include: assetIncludes,
      orderBy: { createdAt: "desc" },
      where: { companyId: session.user.companyId },
    });

    return { data: parseStringify(assets) };
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { error: "Failed to fetch assets" };
  }
}

export async function findById(id: string): Promise<ApiResponse<Asset>> {
  try {
    if (!id) {
      return { error: "Asset ID is required" };
    }

    const asset = await prisma.asset.findFirst({
      include: assetIncludes,
      where: { id },
    });

    console.log(asset);

    if (!asset) {
      return { error: "Asset not found" };
    }

    return { data: parseStringify(asset) };
  } catch (error) {
    console.error("Error finding asset:", error);
    return { error: "Failed to find asset" };
  }
}

export async function remove(id: string): Promise<ApiResponse<Asset>> {
  try {
    if (!id) {
      return { error: "Asset ID is required" };
    }

    const asset = await prisma.asset.delete({
      where: { id },
    });

    return { data: parseStringify(asset) };
  } catch (error) {
    console.error("Error deleting asset:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Asset not found" };
      }
    }
    return { error: "Failed to delete asset" };
  }
}

export async function update(
  asset: Asset,
  id: string,
): Promise<ApiResponse<Asset>> {
  try {
    if (!id || !asset) {
      return { error: "Asset ID and data are required" };
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        name: asset.name,
        serialNumber: asset.serialNumber,
        company: {
          connect: { id: asset.companyId },
        },
        statusLabel: {
          connect: { id: asset.statusLabelId },
        },
      },
    });

    return { data: parseStringify(updatedAsset) };
  } catch (error) {
    console.error("Error updating asset:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Asset not found" };
      }
    }
    return { error: "Failed to update asset" };
  }
}

export async function checkout(
  values: z.infer<typeof assignmentSchema>,
): Promise<ApiResponse<Asset>> {
  try {
    const validation = await assignmentSchema.safeParseAsync(values);

    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
      };
    }

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the asset
      const updatedAsset = await tx.asset.update({
        where: {
          id: values.itemId,
        },
        data: {
          assigneeId: values.userId,
        },
        include: assetIncludes,
      });

      // Create asset history record
      await tx.assetHistory.create({
        data: {
          assetId: values.itemId,
          type: "checkout",
          notes: `Asset checked out to user ${values.userId}`,
          companyId: updatedAsset.companyId,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: "ASSET_CHECKOUT",
          entity: "Asset",
          entityId: values.itemId,
          details: `Asset ${values.itemId} checked out to user ${values.userId}`,
          userId: values.userId,
          companyId: updatedAsset.companyId,
          dataAccessed: {
            assetId: values.itemId,
            assigneeId: values.userId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return updatedAsset;
    });

    return {
      data: parseStringify(result),
    };
  } catch (error) {
    console.error("Error checking out asset:", error);

    return {
      error: "Failed to check out asset",
    };
  }
}

export async function checkin(assetId: string): Promise<ApiResponse<Asset>> {
  try {
    if (!assetId) {
      return { error: "Asset ID is required" };
    }

    // Get current asset state to capture previous assignee for logging
    const currentAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: {
        assigneeId: true,
        companyId: true,
      },
    });

    if (!currentAsset) {
      return { error: "Asset not found" };
    }

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the asset
      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: { assigneeId: null },
        include: assetIncludes,
      });

      // Create asset history record
      await tx.assetHistory.create({
        data: {
          assetId: assetId,
          type: "checkin",
          notes: currentAsset.assigneeId
            ? `Asset checked in from user ${currentAsset.assigneeId}`
            : "Asset checked in",
          companyId: currentAsset.companyId,
        },
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: "ASSET_CHECKIN",
          entity: "Asset",
          entityId: assetId,
          details: currentAsset.assigneeId
            ? `Asset ${assetId} checked in from user ${currentAsset.assigneeId}`
            : `Asset ${assetId} check-in processed`,
          userId: currentAsset.assigneeId || "SYSTEM",
          companyId: currentAsset.companyId,
          dataAccessed: {
            assetId: assetId,
            previousAssignee: currentAsset.assigneeId,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return updatedAsset;
    });

    return { data: parseStringify(result) };
  } catch (error) {
    console.error("Error checking in asset:", error);
    return { error: "Failed to check in asset" };
  }
}

export async function processAssetsCSV(csvContent: string) {
  try {
    const data = processRecordContents(csvContent);
    const session = await auth();
    // Save to database using transaction
    await prisma.$transaction(async (tx) => {
      const records = [];

      for (const item of data) {
        const model = await tx.model.findFirst({
          where: {
            name: item["model"],
          },
        });
        const statusLabel = await tx.statusLabel.findFirst({
          where: {
            name: item["statusLabel"],
          },
        });
        const supplier = await tx.supplier.findFirst({
          where: {
            name: item["supplier"],
          },
        });

        if (!model || !statusLabel || !supplier) {
          continue;
        }
        if (!session) {
          throw new Error("User not authenticated.");
        }

        const record = await tx.asset.create({
          data: {
            name: item["name"],
            weight: roundFloat(Number(item["weight"]), 2),
            serialNumber: item["serialNum"],
            material: item["material"],
            modelId: model?.id,
            endOfLife: new Date(item["endOfLife"]),
            statusLabelId: statusLabel?.id,
            supplierId: supplier?.id,
            poNumber: item["poNumber"],
            price: roundFloat(Number(item["price"]), 2),
            companyId: session?.user?.companyId,
            energyRating: item["energyRatting"],
            dailyOperatingHours: Number(item["dailyOperatingHours"]),
          },
        });
        records.push(record);
      }

      return records;
    });

    revalidatePath("/assets");

    return {
      success: true,
      message: `Successfully processed ${data.length} records`,
      data: data,
    };
  } catch (error) {
    console.error("Error processing CSV:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to process CSV file",
    };
  }
}
