import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { accessorySchema } from "@/lib/schemas";
import {
  getAll,
  insert as insert,
  remove,
} from "@/lib/actions/accessory.actions";

export const MODEL_KEY = ["accessories"] as const;

type CreateAccessoryInput = z.infer<typeof accessorySchema>;

export function useAccessoryQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<Accessory, CreateAccessoryInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateAccessoryInput) => {
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
    items: accessories,
    isLoading,
    error,
    createItem: createAccessory,
    isCreating,
    refresh,
    deleteItem,
  } = genericQuery();

  return {
    accessories,
    isLoading,
    error,
    deleteItem,
    createAccessory,
    isCreating,
    refresh,
  };
}
