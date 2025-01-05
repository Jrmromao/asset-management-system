"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents, roundFloat } from "@/lib/utils";
import { auth } from "@/auth";
import { z } from "zod";
import { assetSchema, assignmentSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import CO2Calculator from "@/services/ChatGPT";
import { getIpAddress } from "@/utils/getIpAddress";

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

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

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

    const [asset, auditLogs] = await Promise.all([
      prisma.asset.findFirst({
        include: assetIncludes,
        where: { id },
      }),
      prisma.auditLog.findMany({
        where: {
          entityId: id,
          entity: "ASSET",
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    console.log(auditLogs);

    if (!asset) {
      return { error: "Asset not found" };
    }

    return {
      data: parseStringify({
        ...asset,
        auditLogs: auditLogs ? auditLogs : [],
      }),
    };
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

    const [asset, auditLogs] = await Promise.all([
      prisma.asset.findFirst({
        include: assetIncludes,
        where: { id },
      }),
      prisma.auditLog.findMany({
        where: {
          entityId: id,
          entity: "ASSET",
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    if (!asset) {
      return { error: "Asset not found" };
    }

    const computedAsset = {
      ...asset,
      auditLogs,
    };
    return {
      data: parseStringify({
        ...asset,
        auditLogs: auditLogs ? auditLogs : [],
      }),
    };
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
          entity: "ASSET",
          entityId: values.itemId,
          details: `Asset checkout completed`,
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
          entity: "ASSET",
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

        // TODO need to complete thi
        console.log(item);
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
            formTemplateId: item["formTemplateId"] || null,
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

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  retryCount = 1,
  initialDelay = 1000,
  maxDelay = 10000,
): Promise<T> {
  let currentTry = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await operation();
    } catch (error) {
      currentTry++;
      if (currentTry >= retryCount) {
        throw error;
      }
      delay = Math.min(delay * 2, maxDelay);
      console.log(
        `Retry attempt ${currentTry} for CO2 calculation. Waiting ${delay}ms...`,
      );
      await wait(delay);
    }
  }
}

export async function create(
  values: z.infer<typeof assetSchema>,
): Promise<ApiResponse<Asset>> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized access" };
  }

  try {
    const validation = assetSchema.safeParse(values);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.errors);
      return { error: validation.error.errors[0].message };
    }

    const calculator = new CO2Calculator({
      openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-4",
      },
    });

    // TODO: please fix this
    // const co2Input: CO2CalculationInput = {
    //   name: values.name,
    //   // Add model information if available
    //   ...(values.model?.name && {
    //     name: `${values.name} ${values.model.name}`,
    //   }),
    //   ...(values.category?.name && { category: values.category.name }),
    //   // Energy and operation details
    //   ...(values.energyRating && { energyRating: values.energyRating }),
    //   ...(values.dailyOperatingHours && {
    //     dailyOperationHours: Number(values.dailyOperatingHours),
    //   }),
    //   // Physical properties
    //   ...(values.weight && { weight: Number(values.weight) }),
    //   ...(values.material && { material: values.material }),
    //   // Location and department
    //   ...(values.departmentLocation?.name && {
    //     location: values.departmentLocation.name,
    //   }),
    //   ...(values.department?.name && {
    //     department: values.department.name,
    //   }),
    //   // Financial information
    //   price: values.price,
    //   // Lifecycle information
    //   ...(values.endOfLife &&
    //     values.purchaseDate && {
    //       expectedLifespan: Math.ceil(
    //         (values.endOfLife.getTime() - values.purchaseDate.getTime()) /
    //           (1000 * 60 * 60 * 24 * 365),
    //       ),
    //     }),
    // };

    let co2Score: number | undefined;
    try {
      // const co2Result = await retryWithExponentialBackoff(
      //   async () => await calculator.calculateCO2e(co2Input),
      //   3, // 3 retry attempts
      //   1000, // Start with 1-second delay
      //   10000, // Max delay of 10 seconds
      // );

      // co2Score = parseFloat(co2Result.CO2e);
      console.log(`Successfully calculated CO2 score: ${co2Score}`);
    } catch (error) {
      console.error("Failed to calculate CO2 score after retries:", error);
      // Continue with asset creation even if CO2 calculation fails
    }

    // Use a transaction to ensure both asset creation and audit log are atomic
    const result = await prisma.$transaction(async (tx) => {
      const newAsset = await tx.asset.create({
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
          formTemplateId: values.formTemplateId || null,
          // co2Score, // Include the calculated CO2 score
        },
        include: assetIncludes,
      });

      // Create audit log entry
      await tx.auditLog.create({
        data: {
          action: "ASSET_CREATED",
          entity: "ASSET",
          entityId: newAsset.id,
          userId: session.user.id || "",
          companyId: session.user.companyId,
          details: `Created asset ${values.name} with serial number ${values.serialNumber}`,
          ipAddress: getIpAddress(),
        },
      });

      if (values.formTemplateId && values.templateValues) {
        await tx.formTemplateValue.createMany({
          data: {
            assetId: newAsset.id,
            templateId: values.formTemplateId!,
            values: values.templateValues,
          },
        });
      }

      return newAsset;
    });

    if (!result) {
      return { error: "Failed to create asset" };
    }

    return { data: parseStringify(result) };
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
