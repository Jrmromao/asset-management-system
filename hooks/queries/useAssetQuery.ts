import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { assetSchema } from "@/lib/schemas";
import {
  findById,
  getAll,
  insert,
  remove,
  update,
} from "@/lib/actions/assets.actions";

export const MODEL_KEY = ["assets"] as const;

export type CreateAssetInput = z.infer<typeof assetSchema>;

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useAssetQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<Asset, CreateAssetInput, CreateAssetInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        const result = await getAll();
        return result as ActionResponse<Asset[]>;
      },
      insert: async (data: CreateAssetInput) => {
        const result = await insert(data);
        return result as ActionResponse<Asset>;
      },
      delete: async (id: string) => {
        const result = await remove(id);
        return result as ActionResponse<Asset>;
      },
      update: async (id: string, data: CreateAssetInput) => {
        const result = await update(id, data);
        return result as ActionResponse<Asset>;
      },
      findById: async (id: string) => {
        const result = await findById(id);
        return result as ActionResponse<Asset>;
      },
    },
    {
      onClose,
      successMessage: "Asset created successfully",
      errorMessage: "Failed to create asset",
      updateSuccessMessage: "Asset updated successfully",
      updateErrorMessage: "Failed to update asset",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: assets,
    isLoading,
    error,
    createItem: createAsset,
    updateItem: updateAsset,
    isCreating,
    isUpdating,
    findById: findItemById,
    refresh,
    deleteItem,
  } = genericQuery();

  return {
    assets,
    isLoading,
    error,
    createAsset,
    updateAsset,
    findItemById,
    isCreating,
    isUpdating,
    refresh,
    deleteItem,
  };
}