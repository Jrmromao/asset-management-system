import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import {
  getAllModels,
  createModel,
  deleteModel,
  updateModel,
} from "@/lib/actions/model.actions";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";

export const MODEL_KEY = ["models"] as const;

type CreateModelInput = z.infer<typeof modelSchema>;
type GenericQueryType = ReturnType<typeof createGenericQuery<Model, CreateModelInput>>;

export function useModelsQuery() {
  const { onClose } = useModelUIStore();

  const genericQuery: GenericQueryType = createGenericQuery<Model, CreateModelInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllModels({});
      },
      insert: async (data: CreateModelInput) => {
        return await createModel(data);
      },
      delete: async (id: string) => {
        return await deleteModel(id);
      },
      update: async (id: string, data: CreateModelInput) => {
        return await updateModel(id, data as any);
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
    updateItem: updateModel,
    deleteItem: deleteModel,
    isCreating,
    isUpdating,
    refresh,
  } = genericQuery();

  return {
    models,
    isLoading,
    error,
    createModel,
    updateModel,
    deleteModel,
    isCreating,
    isUpdating,
    refresh,
  };
}
