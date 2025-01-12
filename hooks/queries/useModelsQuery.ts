import { getAll, insert } from "@/lib/actions/model.actions";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { useEffect } from "react";
import { createGenericQuery } from "@/hooks/queries/useGenericQuery";

export const MODEL_KEY = ["models"] as const;

export function useModelsQuery() {
  const { onClose } = useModelUIStore();

  const genericQuery = createGenericQuery<Model>(
    MODEL_KEY,
    {
      getAll,
      insert,
    },
    {
      onClose,
      successMessage: "Model created successfully",
      errorMessage: "Failed to create model",
    },
  );

  const {
    items: models,
    isLoading,
    error,
    createItem: createModel,
    isCreating,
  } = genericQuery();

  useEffect(() => {
    console.log("Models updated in component:", models);
  }, [models]);

  return {
    models,
    isLoading,
    error,
    createModel,
    isCreating,
  };
}
