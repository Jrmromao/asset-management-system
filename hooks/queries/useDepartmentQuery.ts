import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAll, insert } from "@/lib/actions/model.actions";
import { useModelUIStore } from "@/lib/stores/useModelUIStore";
import { toast } from "sonner";
import { useEffect } from "react";

export const MODEL_KEY = ["models"] as const;

export function useDepartmentQuery() {
  const queryClient = useQueryClient();
  const { onClose } = useModelUIStore();

  const {
    data: models = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: MODEL_KEY,
    queryFn: async () => {
      const result = await getAll();
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: createModel, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<Model, "id">) => {
      const newModel: Model = {
        id: crypto.randomUUID(),
        ...data,
      };
      const result = await insert(newModel);
      if ("error" in result) throw new Error(result.error);
      return result.data;
    },
    // Optimistic update
    onMutate: async (newData) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: MODEL_KEY });

      // Snapshot the previous value
      const previousModels = queryClient.getQueryData(MODEL_KEY);

      // Optimistically update the cache
      const optimisticModel: Model = {
        id: crypto.randomUUID(),
        ...newData,
      };

      queryClient.setQueryData(MODEL_KEY, (old: Model[] = []) => {
        return [...old, optimisticModel].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      // Return context with snapshotted value
      return { previousModels };
    },
    onError: (err, newModel, context) => {
      // If mutation fails, roll back to the previous value
      if (context?.previousModels) {
        queryClient.setQueryData(MODEL_KEY, context.previousModels);
      }
      console.error("Create model error:", err?.message || err);
      toast.error("Failed to create model");
    },
    onSuccess: (data) => {
      toast.success("Model created successfully");
      onClose();
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is synchronized
      queryClient.invalidateQueries({ queryKey: MODEL_KEY });
    },
  });

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
