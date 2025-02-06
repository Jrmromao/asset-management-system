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

type CreateAssetInput = z.infer<typeof assetSchema>;

export function useAssetQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<Asset, CreateAssetInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateAssetInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: Partial<Asset>) => {
        return await update(id, data);
      },
      findById: async (id: string) => {
        return await findById(id);
      },
    },
    {
      onClose,
      successMessage: "Asset created successfully",
      errorMessage: "Failed to create asset",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: assets,
    isLoading,
    error,
    createItem: createAsset,
    isCreating,
    findById: findItemById,
    refresh,
    deleteItem,
  } = genericQuery();

  return {
    assets,
    isLoading,
    error,
    createAsset,
    findItemById,
    isCreating,
    refresh,
    deleteItem,
  };
}
