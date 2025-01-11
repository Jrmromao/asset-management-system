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
      console.log("Fetched data from backend:", result);
      return result;
    },
  });

  const { mutate: createStatusLabel, isPending: isCreating } = useMutation({
    mutationFn: async (data: Omit<StatusLabel, "id">) => {
      const newStatusLabel: StatusLabel = {
        id: crypto.randomUUID(),
        ...data,
      };
      const result = await insert(newStatusLabel);
      console.log("Mutation result from insert:", result);

      if ("error" in result) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: async (data: StatusLabel) => {
      console.log("onSuccess triggered with data:", data);

      const currentCache = queryClient.getQueryData(STATUS_LABELS_KEY);
      console.log("Current cache before setQueryData:", currentCache);

      queryClient.setQueryData(STATUS_LABELS_KEY, (old: StatusLabel[] = []) => {
        console.log("Old data in cache:", old);
        console.log("New data:", data);

        return [...old, data].sort((a, b) => a.name.localeCompare(b.name));
      });

      await queryClient.invalidateQueries({ queryKey: STATUS_LABELS_KEY });

      toast.success("Status Label created successfully");
      onClose();
    },
    onError: (error) => {
      console.error("Create status label error:", error?.message || error);
      toast.error("Failed to create status label");
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
