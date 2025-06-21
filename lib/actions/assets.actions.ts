"use server";

import { prisma } from "@/app/db";
import { assetSchema } from "@/lib/schemas";
import { AssetResponse } from "@/types/asset";
import { withAuth } from "@/lib/middleware/withAuth";
import type { AuthResponse } from "@/lib/middleware/withAuth";
import type { SupabaseUser } from "@/lib/middleware/withAuth";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { checkAssetLimit } from "@/lib/services/usage.service";
import { calculateAssetCo2, createCo2eRecord } from "@/lib/services/ai.service";

type CSVResponse = {
  success: boolean;
  message: string;
};

type TemplateResponse = {
  success: boolean;
  data: string;
  error?: string;
};

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
  purchaseOrderId?: string;
};

const getSession = () => {
  const cookieStore = cookies();
  return {
    accessToken: cookieStore.get("sb-access-token")?.value,
    refreshToken: cookieStore.get("sb-refresh-token")?.value,
  };
};

// Helper function to convert single item to array
const toArray = <T>(item: T | null): T[] => (item ? [item] : []);

export const create = withAuth(
  async (
    user: SupabaseUser,
    data: CreateAssetInput,
  ): Promise<AssetResponse> => {
    try {
      const companyId = user.user_metadata.companyId;

      // Check asset limit
      const { allowed, usage, limit } = await checkAssetLimit(companyId);
      if (!allowed) {
        return {
          success: false,
          data: [],
          error: `Asset limit reached (${usage}/${limit}). Please upgrade your plan.`,
        };
      }

      console.log("[CREATE_ASSET] Received data:", data);
      console.log("[CREATE_ASSET] User:", {
        id: user.id,
        companyId: user.user_metadata.companyId,
      });

      const validation = await assetSchema.parseAsync(data);
      console.log("[CREATE_ASSET] Validation result:", validation);

      if (!validation) {
        console.log("[CREATE_ASSET] Validation failed");
        return {
          success: false,
          data: [],
          error: "Invalid asset data",
        };
      }

      // Extract templateValues from validation and prepare the create data
      const { templateValues, ...assetData } = validation;

      const asset = await prisma.asset.create({
        data: {
          purchaseDate: new Date(),
          ...assetData,
          companyId: companyId,
          // Add nested creation for form template values if they exist
          values: templateValues
            ? {
                create: [
                  {
                    values: templateValues,
                    formTemplate: { connect: { id: assetData.formTemplateId } },
                  },
                ],
              }
            : undefined,
        },
        include: {
          model: {
            include: {
              manufacturer: true,
            },
          },
          user: true,
          supplier: true,
          departmentLocation: true,
          statusLabel: true,
          department: true,
          inventory: true,
          values: true,
        },
      });

      // Calculate and store CO2e record
      if (asset.model) {
        const co2eResponse = await calculateAssetCo2(
          asset.name,
          asset.model.manufacturer.name,
          asset.model.name,
        );

        if (co2eResponse.success) {
          await createCo2eRecord(asset.id, co2eResponse.data);
        } else {
          console.error(
            "Failed to calculate CO2e for asset:",
            co2eResponse.error,
          );
        }
      }

      console.log("[CREATE_ASSET] Created asset:", asset);

      revalidatePath("/assets");
      return { success: true, data: [parseStringify(asset)], error: undefined };
    } catch (error: any) {
      console.error("[CREATE_ASSET] Error:", error);
      return {
        success: false,
        data: [],
        error: error?.message || "Failed to create asset",
      };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function createAsset(
  data: CreateAssetInput,
): Promise<AssetResponse> {
  console.log("[CREATE_ASSET_WRAPPER] Starting with data:", data);
  const response = await create(data);
  console.log("[CREATE_ASSET_WRAPPER] Response:", response);
  return response;
}

export const getAll = withAuth(async (user): Promise<AssetResponse> => {
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
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });

    return {
      success: true,
      data: parseStringify(assets) || [],
      error: undefined,
    };
  } catch (error) {
    console.error("Get assets error:", error);
    return { success: false, data: [], error: "Failed to fetch assets" };
  } finally {
    await prisma.$disconnect();
  }
});

export async function getAllAssets(): Promise<AssetResponse> {
  const session = getSession();
  const response = await getAll();
  return {
    success: response.success,
    data: response.data || [],
    error: response.error,
  };
}

export const getAssetOverview = withAuth(async (user) => {
  try {
    const assetCounts = await prisma.asset.groupBy({
      by: ["modelId"],
      where: {
        companyId: user.user_metadata?.companyId,
      },
      _count: {
        modelId: true,
      },
    });

    const modelIds = assetCounts
      .map((ac) => ac.modelId)
      .filter((id): id is string => !!id);

    const models = await prisma.model.findMany({
      where: {
        id: {
          in: modelIds,
        },
      },
    });

    const modelMap = new Map(models.map((m) => [m.id, m.name]));

    const overview = assetCounts.map((ac) => ({
      name: ac.modelId
        ? modelMap.get(ac.modelId) || "Unknown Model"
        : "Unknown Model",
      count: ac._count.modelId,
    }));

    return { success: true, data: parseStringify(overview) };
  } catch (error) {
    console.error("Get asset overview error:", error);
    return {
      success: false,
      data: [],
      error: "Failed to fetch asset overview",
    };
  } finally {
    await prisma.$disconnect();
  }
});

export const getAssetById = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const asset = await prisma.asset.findFirst({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        include: {
          model: true,
          user: true,
          supplier: true,
          departmentLocation: true,
          statusLabel: true,
          department: true,
          inventory: true,
          formTemplate: true,
          co2eRecords: true,
          assetHistory: true,
          values: {
            include: {
              formTemplate: true,
            },
          },
        },
      });
      if (!asset) {
        return { success: false, data: [], error: "Asset not found" };
      }
      return {
        success: true,
        data: toArray(parseStringify(asset)),
        error: undefined,
      };
    } catch (error) {
      console.error("Get asset error:", error);
      return { success: false, data: [], error: "Failed to fetch asset" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function getAsset(id: string): Promise<AssetResponse> {
  const session = getSession();
  const response = await getAssetById(id);
  return {
    success: response.success,
    data: response.data || [],
    error: response.error,
  };
}

export const remove = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const asset = await prisma.asset.delete({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
      });
      revalidatePath("/assets");
      return {
        success: true,
        data: toArray(parseStringify(asset)),
        error: undefined,
      };
    } catch (error) {
      console.error("Delete asset error:", error);
      return { success: false, data: [], error: "Failed to delete asset" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function removeAsset(id: string): Promise<AssetResponse> {
  const session = getSession();
  const response = await remove(id);
  return {
    success: response.success,
    data: response.data || [],
    error: response.error,
  };
}

export const update = withAuth(
  async (user, id: string, data: CreateAssetInput): Promise<AssetResponse> => {
    try {
      const existingAsset = await prisma.asset.findUnique({
        where: { id },
        include: { values: true },
      });

      if (!existingAsset) {
        return { success: false, data: [], error: "Asset not found" };
      }

      const validation = assetSchema.safeParse(data);
      if (!validation.success) {
        return {
          success: false,
          data: [],
          error: validation.error.errors[0].message,
        };
      }

      const { templateValues, ...assetData } = validation.data;

      const asset = await prisma.asset.update({
        where: { id },
        data: {
          ...assetData,
          values: {
            deleteMany: {
              assetId: id,
            },
            create: templateValues
              ? [
                  {
                    values: templateValues,
                    formTemplate: {
                      connect: { id: assetData.formTemplateId },
                    },
                  },
                ]
              : [],
          },
        },
        include: {
          model: true,
          user: true,
          supplier: true,
          departmentLocation: true,
          statusLabel: true,
          department: true,
          inventory: true,
          values: true,
        },
      });

      revalidatePath("/assets");
      return {
        success: true,
        data: toArray(parseStringify(asset)),
        error: undefined,
      };
    } catch (error) {
      console.error("Update asset error:", error);
      return { success: false, data: [], error: "Failed to update asset" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function updateAsset(
  id: string,
  data: CreateAssetInput,
): Promise<AssetResponse> {
  const session = getSession();
  const response = await update(id, data);
  return {
    success: response.success,
    data: response.data || [],
    error: response.error,
  };
}

export const findById = withAuth(async (user, id: string) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: {
        id: id,
        companyId: user.user_metadata.companyId,
      },
      include: {
        model: true,
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
        formTemplate: true,
        co2eRecords: true,
        assetHistory: true,
        values: {
          include: {
            formTemplate: true,
          },
        },
      },
    });

    if (!asset) {
      return { success: false, data: null, error: "Asset not found" };
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        entityId: asset.id,
        companyId: user.user_metadata.companyId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = { ...asset, auditLogs };

    return { success: true, data: parseStringify(data) };
  } catch (error) {
    console.error("Find asset by id error:", error);
    return { success: false, data: null, error: "Failed to find asset" };
  } finally {
    await prisma.$disconnect();
  }
});

export async function findAssetById(id: string): Promise<AssetResponse> {
  const response = await findById(id);
  return {
    success: response.success,
    data: response.data ? [response.data] : [],
    error: response.error,
  };
}

export const checkin = withAuth(
  async (user, id: string): Promise<AssetResponse> => {
    try {
      const asset = await prisma.asset.update({
        where: { id },
        data: {
          userId: null,
        },
        include: {
          model: true,
          user: true,
          supplier: true,
          departmentLocation: true,
          statusLabel: true,
          department: true,
          inventory: true,
        },
      });
      revalidatePath("/assets");
      return {
        success: true,
        data: toArray(parseStringify(asset)),
        error: undefined,
      };
    } catch (error) {
      console.error("Checkin asset error:", error);
      return { success: false, data: [], error: "Failed to check in asset" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function checkinAsset(id: string): Promise<AssetResponse> {
  const session = getSession();
  const response = await checkin(id);
  return {
    success: response.success,
    data: response.data || [],
    error: response.error,
  };
}

export const checkout = withAuth(
  async (user, id: string, userId: string): Promise<AssetResponse> => {
    try {
      const asset = await prisma.asset.update({
        where: {
          id,
          companyId: user.user_metadata?.companyId,
        },
        data: {
          userId,
        },
        include: {
          model: true,
          user: true,
          supplier: true,
          departmentLocation: true,
          statusLabel: true,
          department: true,
          inventory: true,
        },
      });
      revalidatePath("/assets");
      return {
        success: true,
        data: toArray(parseStringify(asset)),
        error: undefined,
      };
    } catch (error) {
      console.error("Checkout asset error:", error);
      return { success: false, data: [], error: "Failed to checkout asset" };
    } finally {
      await prisma.$disconnect();
    }
  },
);

export async function checkoutAsset(
  id: string,
  userId: string,
): Promise<AssetResponse> {
  const session = getSession();
  const response = await checkout(id, userId);
  return {
    success: response.success,
    data: response.data || [],
    error: response.error,
  };
}

export const processAssetsCSV = withAuth(
  async (user, csvContent: string): Promise<AuthResponse<CSVResponse>> => {
    try {
      const rows = csvContent.split("\n").map((row) => row.split(","));
      const headers = rows[0];
      const assets = rows.slice(1).map((row) => {
        const asset: Record<string, string> = {};
        headers.forEach((header, index) => {
          asset[header.trim()] = row[index]?.trim() || "";
        });
        return asset;
      });

      // Process assets here...
      return {
        success: true,
        data: {
          success: true,
          message: "CSV processed successfully",
        },
      };
    } catch (error) {
      console.error("Process CSV error:", error);
      return {
        success: false,
        data: {
          success: false,
          message: "Failed to process CSV",
        },
      };
    }
  },
);

export async function processAssetCSV(
  csvContent: string,
): Promise<CSVResponse> {
  try {
    // Process CSV logic here
    return {
      success: true,
      message: "CSV processed successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to process CSV",
    };
  }
}

export const generateAssetCSVTemplate = withAuth(
  async (user): Promise<TemplateResponse> => {
    try {
      const headers = [
        "name",
        "serialNumber",
        "modelId",
        "statusLabelId",
        "departmentId",
        "inventoryId",
        "locationId",
      ];

      const template = headers.join(",");
      return {
        success: true,
        data: template,
        error: undefined,
      };
    } catch (error) {
      console.error("Generate template error:", error);
      return {
        success: false,
        data: "",
        error: "Failed to generate template",
      };
    }
  },
);

export async function generateCSVTemplate(): Promise<TemplateResponse> {
  try {
    // Generate CSV template logic here
    return {
      success: true,
      data: "template content",
      error: undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: "",
      error: "Failed to generate template",
    };
  }
}

export const exportToCSV = withAuth(async (user): Promise<TemplateResponse> => {
  try {
    const assets = await prisma.asset.findMany({
      where: { companyId: user.user_metadata.companyId },
      include: {
        model: true,
        user: true,
        supplier: true,
        departmentLocation: true,
        statusLabel: true,
        department: true,
        inventory: true,
      },
    });

    const headers = [
      "name",
      "serialNumber",
      "model",
      "status",
      "department",
      "inventory",
      "location",
    ];

    const rows = assets.map((asset) => [
      asset.name,
      asset.serialNumber,
      asset.model?.name || "",
      asset.statusLabel?.name || "",
      asset.department?.name || "",
      asset.inventory?.name || "",
      asset.departmentLocation?.name || "",
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n",
    );
    return {
      success: true,
      data: csv,
      error: undefined,
    };
  } catch (error) {
    console.error("Export to CSV error:", error);
    return {
      success: false,
      data: "",
      error: "Failed to export to CSV",
    };
  }
});

export async function exportAssetsToCSV(): Promise<TemplateResponse> {
  try {
    // Export assets to CSV logic here
    return {
      success: true,
      data: "csv content",
      error: undefined,
    };
  } catch (error) {
    return {
      success: false,
      data: "",
      error: "Failed to export assets",
    };
  }
}

export async function setMaintenanceStatus(
  assetId: string,
): Promise<AssetResponse> {
  try {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { companyId: true },
    });

    if (!asset) {
      return { success: false, data: [], error: "Asset not found" };
    }

    const maintenanceStatus = await prisma.statusLabel.findFirst({
      where: {
        name: "Maintenance",
        companyId: asset.companyId,
      },
    });

    if (!maintenanceStatus) {
      return {
        success: false,
        data: [],
        error:
          'Status label "Maintenance" not found. Please create it first.',
      };
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: { statusLabelId: maintenanceStatus.id },
    });

    revalidatePath(`/assets/view/${assetId}`);

    return { success: true, data: [parseStringify(updatedAsset)] };
  } catch (error) {
    console.error("Set maintenance status error:", error);
    return {
      success: false,
      data: [],
      error: "Failed to set maintenance status",
    };
  } finally {
    await prisma.$disconnect();
  }
}
