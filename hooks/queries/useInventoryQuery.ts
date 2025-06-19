import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { inventorySchema } from "@/lib/schemas";
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
        const res = await fetch("/api/inventory");
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to fetch inventories");
        }
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to fetch inventories");
        }
        return data.data;
      },
      insert: async (data: CreateInventorySchemaInput) => {
        const res = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to create inventory");
        }
        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to create inventory");
        }
        return result.data;
      },
      delete: async (id: string) => {
        const res = await fetch(`/api/inventory?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to delete inventory");
        }
        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to delete inventory");
        }
        return result.data;
      },
      update: async (id: string, data: Partial<Inventory>) => {
        const res = await fetch(`/api/inventory?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to update inventory");
        }
        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to update inventory");
        }
        return result.data;
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
