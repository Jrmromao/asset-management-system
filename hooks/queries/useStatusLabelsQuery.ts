import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { statusLabelSchema } from "@/lib/schemas";
import { getAll, insert, remove } from "@/lib/actions/statusLabel.actions";
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
    },
    {
      onClose,
      successMessage: "",
      errorMessage: "",
    },
  );

  const {
    items: statusLabels,
    isLoading,
    error,
    createItem: createStatusLabel,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    statusLabels,
    isLoading,
    error,
    createStatusLabel,
    isCreating,
    refresh,
  };
}
