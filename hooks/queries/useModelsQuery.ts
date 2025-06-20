import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { modelSchema } from "@/lib/schemas";
import {
  getAllModels,
  createModel as createModelAction,
  deleteModel as deleteModelAction,
  updateModel as updateModelAction,
} from "@/lib/actions/model.actions";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { ModelWithRelations } from "@/types/model";
import { Model } from "@prisma/client";

export const MODEL_KEY = ["models"] as const;

type CreateModelInput = z.infer<typeof modelSchema>;
type UpdateModelInput = Partial<CreateModelInput>;
type ActionResponse<T> = { data?: T; error?: string; success: boolean };

type CrudActions = {
  getAll: () => Promise<ActionResponse<ModelWithRelations[]>>;
  insert: (
    data: CreateModelInput,
  ) => Promise<ActionResponse<ModelWithRelations>>;
  delete: (id: string) => Promise<ActionResponse<Model>>;
  update: (
    id: string,
    data: UpdateModelInput,
  ) => Promise<ActionResponse<ModelWithRelations>>;
};

const modelActions: CrudActions = {
  getAll: () => getAllModels({}) as Promise<ActionResponse<ModelWithRelations[]>>,

  insert: (data: CreateModelInput) =>
    createModelAction(data) as Promise<ActionResponse<ModelWithRelations>>,

  delete: (id: string) => deleteModelAction(id) as Promise<ActionResponse<Model>>,

  update: (id: string, data: UpdateModelInput) =>
    updateModelAction(id, data) as Promise<ActionResponse<ModelWithRelations>>,
};

export function useModelsQuery() {
  const { onClose } = useModelUIStore();

  const genericQuery = createGenericQuery<ModelWithRelations, CreateModelInput>(
    MODEL_KEY,
    modelActions,
    {
      onClose,
      successMessage: "Operation completed successfully",
      errorMessage: "Operation failed",
      staleTime: 5 * 60 * 1000,
      retry: 1,
      retryDelay: 1000,
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
