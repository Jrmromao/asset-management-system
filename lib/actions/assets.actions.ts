"use server";

import { prisma } from "@/app/db";
import { parseStringify, processRecordContents, roundFloat } from "@/lib/utils";
import { auth } from "@/auth";
import { z } from "zod";
import { assetSchema, assignmentSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import CO2Calculator, {
  CO2CalculationInput,
  CO2Response,
} from "../../services/OpenAI";
import { getIpAddress } from "@/utils/getIpAddress";

// Common include object for consistent asset queries
const assetIncludes = {
  model: {
    include: {
      manufacturer: true,
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
  Co2eRecord: {
    orderBy: { createdAt: "asc" },
    take: 1,
  },
} as const;

export async function getAll(): Promise<ActionResponse<Asset[]>> {
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

export async function findById(id: string): Promise<ActionResponse<Asset>> {
  try {
    if (!id) {
      return { error: "Asset ID is required" };
    }

    const [asset, auditLogs] = await Promise.all([
      prisma.asset.findFirst({
        include: {
          ...assetIncludes,
        },
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

export async function remove(id: string): Promise<ActionResponse<Asset>> {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return { error: "Unauthorized access" };
    }
    const { id: userId, companyId } = session.user;

    if (!id) {
      return { error: "Asset ID is required" };
    }

    // First fetch the existing asset
    const existingAsset = await prisma.asset.findFirst({
      where: { id },
      include: assetIncludes,
    });

    if (!existingAsset) {
      return { error: "Asset not found" };
    }

    // Update asset and create related records in a transaction
    const updatedAsset = await prisma.$transaction(async (prisma) => {
      // Update the asset status
      const asset = await prisma.asset.update({
        where: { id },
        data: {
          status: "Inactive",
        },
        include: assetIncludes,
      });

      // Create asset history record
      await prisma.assetHistory.create({
        data: {
          assetId: id,
          type: "status_change",
          notes: `Status changed from ${existingAsset.status} to Inactive`,
          companyId,
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: "DEACTIVATE",
          entity: "ASSET",
          entityId: id,
          details: `Asset ${existingAsset.name} (${existingAsset.serialNumber}) was deactivated`,
          userId: userId!,
          companyId,
          dataAccessed: {
            previousStatus: existingAsset.status,
            newStatus: "Inactive",
            assetName: existingAsset.name,
            serialNumber: existingAsset.serialNumber,
            timestamp: new Date(),
          },
        },
      });

      return asset;
    });

    // Fetch updated audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityId: id,
        entity: "ASSET",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: parseStringify({
        ...updatedAsset,
        auditLogs: auditLogs || [],
      }),
    };
  } catch (error) {
    console.error("Error deactivating asset:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { error: "Asset not found" };
      }
    }
    return { error: "Failed to deactivate asset" };
  }
}

export async function update(
  id: string,
  data: Partial<Asset>,
): Promise<ActionResponse<Asset>> {
  try {
    if (!id || !data) {
      return { error: "Asset ID and data are required" };
    }

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: {
        name: data.name,
        serialNumber: data.serialNumber,
        company: {
          connect: { id: data.companyId },
        },
        statusLabel: {
          connect: { id: data.statusLabelId },
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
): Promise<ActionResponse<Asset>> {
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

export async function checkin(assetId: string): Promise<ActionResponse<Asset>> {
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

// export async function insert(
//   values: z.infer<typeof assetSchema>,
// ): Promise<ActionResponse<Asset>> {
//   const session = await auth();
//   if (!session?.user) {
//     return { error: "Unauthorized access" };
//   }
//
//   try {
//     const validation = await assetSchema.safeParseAsync(values);
//
//     if (!validation.success) {
//       return {
//         error: validation.error.errors[0].message,
//       };
//     }
//
//     const calculator = new CO2Calculator({
//       openai: {
//         apiKey:
//           "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",
//         model: "gpt-3.5-turbo",
//       },
//     });
//
//     console.log("-----VALUES: ", values);
//
//     const co2Input: CO2CalculationInput = {
//       name: values.name,
//       // // Add model information if available
//       // ...(values.model?.name && {
//       //   name: `${values.name} ${values.model.name}`,
//       // }),
//       // ...(values.category?.name && { category: values.category.name }),
//       // // Energy and operation details
//       // ...(values.energyRating && { energyRating: values.energyRating }),
//       // ...(values.dailyOperatingHours && {
//       //   dailyOperationHours: Number(values.dailyOperatingHours),
//       // }),
//       // // Physical properties
//       // ...(values.weight && { weight: Number(values.weight) }),
//       // ...(values.material && { material: values.material }),
//       // // Location and department
//       // ...(values.departmentLocation?.name && {
//       //   location: values.departmentLocation.name,
//       // }),
//       // ...(values.department?.name && {
//       //   department: values.department.name,
//       // }),
//       // Financial information
//       // price: values.price,
//       // Lifecycle information
//       // ...(values.endOfLife &&
//       //   values.purchaseDate && {
//       //     expectedLifespan: Math.ceil(
//       //       (values.endOfLife.getTime() - values.purchaseDate.getTime()) /
//       //         (1000 * 60 * 60 * 24 * 365),
//       //     ),
//       //   }),
//     };
//
//     try {
//       const co2Result = await retryWithExponentialBackoff(
//         async () => await calculator.calculateCO2e(co2Input),
//         3, // 3 retry attempts
//         3000, // Start with 1-second delay
//         10000, // Max delay of 10 seconds
//       );
//
//       // co2Score = parseFloat(co2Result.CO2e);
//       console.log(
//         `\n\nSuccessfully calculated CO2 score: ${JSON.stringify(co2Result)}`,
//       );
//     } catch (error) {
//       console.error("Failed to calculate CO2 score after retries:", error);
//       // Continue with asset creation {}|:"?Pprisma migrate dev --namebn|:"?{even if CO2 calculation fails
//     }
//
//     const result = await prisma.$transaction(async (tx) => {
//       const newAsset = await tx.asset.create({
//         data: {
//           name: values.name,
//           serialNumber: values.serialNumber,
//           modelId: values.modelId,
//           statusLabelId: values.statusLabelId,
//           companyId: session.user.companyId,
//           locationId: values.locationId,
//           departmentId: values.departmentId,
//           inventoryId: values.inventoryId,
//           formTemplateId: values.formTemplateId || null,
//         },
//         include: assetIncludes,
//       });
//
//       // Create audit log entry
//       await tx.auditLog.create({
//         data: {
//           action: "ASSET_CREATED",
//           entity: "ASSET",
//           entityId: newAsset.id,
//           userId: session.user.id || "",
//           companyId: session.user.companyId,
//           details: `Created asset ${values.name} with serial number ${values.serialNumber}`,
//           ipAddress: getIpAddress(),
//         },
//       });
//
//       if (values.formTemplateId && values.templateValues) {
//         await tx.formTemplateValue.createMany({
//           data: {
//             assetId: newAsset.id,
//             templateId: values.formTemplateId!,
//             values: values.templateValues,
//           },
//         });
//       }
//
//       if (co2Input) {
//         await tx.co2eRecord.create({
//           data: {
//             itemType: "ASSET",
//             itemId: newAsset.id,
//             co2e: co2Result.CO2e,
//           },
//         });
//       }
//
//       return newAsset;
//     });
//
//     if (!result) {
//       return { error: "Failed to create asset" };
//     }
//
//     return { data: parseStringify(result) };
//   } catch (error) {
//     console.error("Error creating asset:", error);
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P2002") {
//         return { error: "Serial number already exists" };
//       }
//     }
//     return { error: "Failed to create asset" };
//   }
// }

export async function insert(
  values: z.infer<typeof assetSchema>,
): Promise<ActionResponse<Asset>> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized access" };
  }

  try {
    const validation = await assetSchema.safeParseAsync(values);

    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
      };
    }

    const calculator = new CO2Calculator({
      openai: {
        apiKey: process.env.OPENAI_API_KEY!,
        model: "gpt-3.5-turbo",
      },
    });

    const co2Input: CO2CalculationInput = {
      name: values.name,
    };

    // Calculate CO2 score outside the transaction
    let co2Result: CO2Response | null = null;
    try {
      co2Result = await retryWithExponentialBackoff(
        async () => await calculator.calculateCO2e(co2Input),
        3,
        3000,
        10000,
      );
      console.log(
        `Successfully calculated CO2 score: ${JSON.stringify(co2Result)}`,
      );
    } catch (error) {
      console.error("Failed to calculate CO2 score after retries:", error);
      // Continue with asset creation even if CO2 calculation fails
    }

    const result = await prisma.$transaction(async (tx) => {
      const newAsset = await tx.asset.create({
        data: {
          name: values.name,
          serialNumber: values.serialNumber,
          modelId: values.modelId,
          statusLabelId: values.statusLabelId,
          companyId: session.user.companyId,
          locationId: values.locationId,
          departmentId: values.departmentId,
          inventoryId: values.inventoryId,
          formTemplateId: values.formTemplateId || null,
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
            templateId: values.formTemplateId,
            values: values.templateValues,
          },
        });
      }

      // Save CO2 result if calculation was successful
      if (co2Result) {
        const [co2, unit] = co2Result.CO2e.split(" ");
        await tx.co2eRecord.create({
          data: {
            itemType: "ASSET",
            assetId: newAsset.id,
            units: unit,
            co2e: parseFloat(co2),
            co2eType: co2Result.CO2eType,
            sourceOrActivity: co2Result.sourceOrActivity,
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
