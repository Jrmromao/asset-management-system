import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { assetSchema } from "@/lib/schemas";

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
        const response = await fetch('/api/assets');
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        return response.json();
      },
      insert: async (data: CreateAssetInput) => {
        const response = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create asset');
        }
        return response.json();
      },
      delete: async (id: string) => {
        const response = await fetch(`/api/assets/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete asset');
        }
        return response.json();
      },
      update: async (id: string, data: CreateAssetInput) => {
        const response = await fetch(`/api/assets/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update asset');
        }
        return response.json();
      },
      findById: async (id: string) => {
        const response = await fetch(`/api/assets/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch asset');
        }
        return response.json();
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