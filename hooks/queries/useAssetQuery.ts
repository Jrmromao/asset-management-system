import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { assetSchema } from "@/lib/schemas";
import { getAll, insert, remove } from "@/lib/actions/assets.actions";

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
    refresh,
    deleteItem,
  } = genericQuery();

  return {
    assets,
    isLoading,
    error,
    createAsset,
    isCreating,
    refresh,
    deleteItem,
  };
}
