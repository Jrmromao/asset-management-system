import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import {
  getAllStatusLabels,
  createStatusLabel,
  deleteStatusLabel,
  updateStatusLabel,
} from "@/lib/actions/statusLabel.actions";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";

export const MODEL_KEY = ["statusLabels"] as const;

type CreateStatusLabelInput = z.infer<typeof statusLabelSchema>;
type GenericQueryType = ReturnType<typeof createGenericQuery<StatusLabel, CreateStatusLabelInput>>;

export function useStatusLabelsQuery() {
  const { onClose } = useStatusLabelUIStore();

  const genericQuery: GenericQueryType = createGenericQuery<StatusLabel, CreateStatusLabelInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllStatusLabels();
      },
      insert: async (data: CreateStatusLabelInput) => {
        return await createStatusLabel(data);
      },
      delete: async (id: string) => {
        return deleteStatusLabel(id);
      },
      update: async (id: string, data: CreateStatusLabelInput) => {
        return await updateStatusLabel(id, data as any);
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
    deleteItem: deleteStatusLabel,
    isCreating,
    isDeleting,
    isUpdating,
    refresh,
  } = genericQuery();

  return {
    statusLabels,
    isLoading,
    error,
    createStatusLabel,
    updateStatusLabel,
    deleteStatusLabel,
    isDeleting,
    isUpdating,
    isCreating,
    refresh,
  };
}
