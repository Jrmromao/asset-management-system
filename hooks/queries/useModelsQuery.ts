import { getAll, insert, remove, update } from "@/lib/actions/model.actions";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";

export const MODEL_KEY = ["models"] as const;

type CreateModelInput = z.infer<typeof modelSchema>;

export function useModelsQuery() {
  const { onClose } = useModelUIStore();

  const genericQuery = createGenericQuery<Model, CreateModelInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateModelInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: Partial<Model>) => {
        return await update(id, data);
      },
    },
    {
      onClose,
      successMessage: "Model created successfully",
      errorMessage: "Failed to create model",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: models,
    isLoading,
    error,
    createItem: createModel,
    isCreating,
    updateItem: updateModel,
    isUpdating,
    deleteItem: deleteModel,
    isDeleting,
    refresh,
  } = genericQuery();

  return {
    models,
    isLoading,
    error,
    updateModel,
    createModel,
    deleteModel,
    isUpdating,
    isDeleting,
    isCreating,
    refresh,
  };
}
