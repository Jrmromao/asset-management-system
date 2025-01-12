import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAll, insert } from "@/lib/actions/statusLabel.actions";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";
import { toast } from "sonner";
import { useEffect } from "react";

export const STATUS_LABELS_KEY = ["statusLabels"] as const;

export function useStatusLabelsQuery() {
  const queryClient = useQueryClient();
  const { onClose } = useStatusLabelUIStore();

  const {
    data: statusLabels = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: STATUS_LABELS_KEY,
    queryFn: async () => {
      const result = await getAll();
      return result;
    },
    staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
  });

  const { mutate: createStatusLabel, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<StatusLabel, "id">) => {
      const newStatusLabel: StatusLabel = {
        id: crypto.randomUUID(),
        ...data,
      };
      const result = await insert(newStatusLabel);

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    // Add optimistic update
    onMutate: async (newData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: STATUS_LABELS_KEY });

      // Snapshot the previous value
      const previousStatusLabels = queryClient.getQueryData(STATUS_LABELS_KEY);

      // Create optimistic status label
      const optimisticStatusLabel: StatusLabel = {
        id: crypto.randomUUID(),
        ...newData,
      };

      // Optimistically update the cache
      queryClient.setQueryData(STATUS_LABELS_KEY, (old: StatusLabel[] = []) => {
        return [...old, optimisticStatusLabel].sort((a, b) =>
          a.name.localeCompare(b.name),
        );
      });

      // Return context with the snapshotted value
      return { previousStatusLabels };
    },
    onError: (err, newStatusLabel, context) => {
      // If mutation fails, roll back to the previous value
      if (context?.previousStatusLabels) {
        queryClient.setQueryData(
          STATUS_LABELS_KEY,
          context.previousStatusLabels,
        );
      }
      console.error("Create status label error:", err?.message || err);
      toast.error("Failed to create status label");
    },
    onSuccess: (data) => {
      toast.success("Status Label created successfully");
      onClose();
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is synchronized
      queryClient.invalidateQueries({ queryKey: STATUS_LABELS_KEY });
    },
  });

  useEffect(() => {
    console.log("Status labels updated in component:", statusLabels);
  }, [statusLabels]);

  return {
    statusLabels,
    isLoading,
    error,
    createStatusLabel,
    isCreating,
  };
}
