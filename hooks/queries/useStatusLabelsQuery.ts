import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import {
  getAll,
  insert,
  remove,
  update,
} from "@/lib/actions/statusLabel.actions";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";

export const MODEL_KEY = ["statusLabels"] as const;

type CreateStatusLabelInput = z.infer<typeof statusLabelSchema>;

export function useStatusLabelsQuery() {
  const { onClose } = useStatusLabelUIStore();

  const genericQuery = createGenericQuery<StatusLabel, CreateStatusLabelInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateStatusLabelInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return remove(id);
      },
      update: async (id: string, data: Partial<StatusLabel>) => {
        return await update(id, data);
      },
    },
    {
      onClose,
      successMessage: "Status label created successfully",
      updateSuccessMessage: "Status label updated successfully",
      deleteSuccessMessage: "Status label deleted successfully",
      errorMessage: "Failed to create status label",
      updateErrorMessage: "Failed to update status label",
      deleteErrorMessage: "Failed to delete status label",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: statusLabels,
    isLoading,
    error,
    createItem: createStatusLabel,
    updateItem: updateStatusLabel,
    isCreating,
    isUpdating,
    refresh,
  } = genericQuery();

  return {
    statusLabels,
    isLoading,
    error,
    createStatusLabel,
    updateStatusLabel,
    isUpdating,
    isCreating,
    refresh,
  };
}
