import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { inventorySchema } from "@/lib/schemas";
import { useInventoryUIStore } from "@/lib/stores/useInventoryUIStore";
import {
  getAllInventories,
  createInventory,
  deleteInventory,
  updateInventory,
} from "@/lib/actions/inventory.actions";
import type { Inventory } from "@prisma/client";

// Constants
export const MODEL_KEY = ["inventories"] as const;

// Types
type CreateInventoryInput = z.infer<typeof inventorySchema>;
type UpdateInventoryInput = Partial<Pick<Inventory, "name">>;

// Configuration
const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  successMessages: {
    create: "Inventory created successfully",
    update: "Inventory updated successfully",
    delete: "Inventory deleted successfully",
  },
  errorMessages: {
    create: "Failed to create inventory",
    update: "Failed to update inventory",
    delete: "Failed to delete inventory",
  },
} as const;

/**
 * Custom hook for managing inventory data with CRUD operations
 * Uses server actions directly for better type safety and performance
 */
export function useInventoryQuery() {
  const { onClose } = useInventoryUIStore();

  const genericQuery = createGenericQuery<
    Inventory,
    CreateInventoryInput,
    UpdateInventoryInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        const response = await getAllInventories();
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch inventories");
        }
        return response;
      },
      insert: async (data: CreateInventoryInput) => {
        const response = await createInventory(data);
        if (!response.success) {
          throw new Error(response.error || "Failed to create inventory");
        }
        return response;
      },
      update: async (id: string, data: UpdateInventoryInput) => {
        const response = await updateInventory(id, data);
        if (!response.success) {
          throw new Error(response.error || "Failed to update inventory");
        }
        return response;
      },
      delete: async (id: string) => {
        const response = await deleteInventory(id);
        if (!response.success) {
          throw new Error(response.error || "Failed to delete inventory");
        }
        return response;
      },
    },
    {
      onClose,
      successMessage: "Inventory operation successful",
      errorMessage: "Inventory operation failed",
    },
  );

  const result = genericQuery();

  return {
    inventories: result.items || [],
    isLoading: result.isLoading,
    error: result.error,
    createInventory: result.createItem,
    updateInventory: result.updateItem,
    deleteInventory: result.deleteItem,
    isCreating: result.isCreating,
    isDeleting: result.isDeleting,
    isUpdating: result.isUpdating,
    refresh: result.refresh,
  };
}
