import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { accessorySchema } from "@/lib/schemas";
import {
  createAccessory,
  deleteAccessory,
  getAllAccessories,
  updateAccessory,
} from "@/lib/actions/accessory.actions";

export const MODEL_KEY = ["accessories"] as const;

type CreateAccessoryInput = z.infer<typeof accessorySchema>;

export function useAccessoryQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery: ReturnType<typeof createGenericQuery<Accessory, CreateAccessoryInput>> = createGenericQuery<Accessory, CreateAccessoryInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllAccessories();
      },
      insert: async (data: CreateAccessoryInput) => {
        return await createAccessory(data);
      },
      delete: async (id: string) => {
        return await deleteAccessory(id);
      },
      update: async (id: string, data: Partial<Accessory>) => {
        const result = await updateAccessory(id, data);
        return result as unknown as ActionResponse<Accessory>;
      },
    },
    {
      onClose,
      successMessage: "Accessory created successfully",
      errorMessage: "Failed to create accessory",
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
