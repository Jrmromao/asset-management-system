import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { inventorySchema } from "@/lib/schemas";
import {
  getAll,
  insert,
  remove,
  update,
} from "@/lib/actions/inventory.actions";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";

export const MODEL_KEY = ["inventories"] as const;

type CreateInventorySchemaInput = z.infer<typeof inventorySchema>;

export function useInventoryQuery() {
  const { onClose } = useInventoryUIStore();

  const genericQuery = createGenericQuery<
    Inventory,
    CreateInventorySchemaInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateInventorySchemaInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: Partial<Inventory>) => {
        return await update(id, data);
      },
    },
    {
      onClose,
      successMessage: "Inventory created successfully",
      errorMessage: "Failed to create inventory",
      deleteSuccessMessage: "Inventory deleted successfully",
      deleteErrorMessage: "Failed to delete inventory",
      updateSuccessMessage: "Inventory updated successfully",
      updateErrorMessage: "Failed to update inventory",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: inventories,
    isLoading,
    error,
    createItem: createInventory,
    deleteItem: deleteInventory,
    updateItem: updateInventory,
    isCreating,
    isDeleting,
    isUpdating,
    refresh,
  } = genericQuery();

  return {
    inventories,
    isLoading,
    error,
    createInventory,
    deleteInventory,
    updateInventory,
    isCreating,
    isDeleting,
    isUpdating,
    refresh,
  };
}
