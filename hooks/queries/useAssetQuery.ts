import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
  getAllAssets,
  createAsset,
  removeAsset,
  updateAsset,
  findAssetById,
  type CreateAssetInput,
} from "@/lib/actions/assets.actions";
import { useAssetUIStore } from "@/lib/stores";
import type { AssetWithRelations } from "@/types/asset";
import { useUser } from "@clerk/nextjs";

export const MODEL_KEY = ["assets"] as const;

export function useAssetQuery() {
  const { onClose } = useAssetUIStore();
  const { user } = useUser();

  const genericQuery = createGenericQuery<
    AssetWithRelations,
    CreateAssetInput,
    CreateAssetInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        if (!user) {
          return {
            success: false,
            data: [],
            error: "User not authenticated",
          };
        }
        const response = await getAllAssets();
        return {
          success: response.success,
          data: response.data as AssetWithRelations[],
          error: "error" in response ? response.error : undefined,
        };
      },
      insert: async (data) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await createAsset(data);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
      delete: async (id) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await removeAsset(id);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
      update: async (id, data) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await updateAsset(id, data);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
      findById: async (id) => {
        if (!user) {
          return {
            success: false,
            data: undefined,
            error: "User not authenticated",
          };
        }
        const response = await findAssetById(id);
        return {
          success: response.success,
          data: Array.isArray(response.data) ? response.data[0] : undefined,
          error: response.error,
        };
      },
    },
    {
      onClose,
    },
  );

  return genericQuery;
}
