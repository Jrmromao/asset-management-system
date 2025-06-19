import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
  getAllAssets,
  createAsset,
  removeAsset,
  updateAsset,
  type CreateAssetInput,
} from "@/lib/actions/assets.actions";
import { useAssetUIStore } from "@/lib/stores";
import type { Asset, AssetResponse } from "@/types/asset";

export const MODEL_KEY = ["assets"] as const;

type ActionResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export function useAssetQuery() {
  const { onClose } = useAssetUIStore();

  const genericQuery = createGenericQuery<
    Asset,
    CreateAssetInput,
    CreateAssetInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        const response = await getAllAssets();
        return {
          success: response.success,
          data: response.data,
          error: response.error,
        };
      },
      insert: async (data) => {
        const response = await createAsset(data);
        return {
          success: response.success,
          data: response.data[0],
          error: response.error,
        };
      },
      delete: async (id) => {
        const response = await removeAsset(id);
        return {
          success: response.success,
          data: response.data[0],
          error: response.error,
        };
      },
      update: async (id, data) => {
        const response = await updateAsset(id, data);
        return {
          success: response.success,
          data: response.data[0],
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
