import { getAll, insert, remove } from "@/lib/actions/model.actions";
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
    refresh,
  } = genericQuery();

  return {
    models,
    isLoading,
    error,
    createModel,
    isCreating,
    refresh,
  };
}
