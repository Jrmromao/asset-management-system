import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { supplierSchema } from "@/lib/schemas";
import {
  createSupplier as createSupplierAction,
  deleteSupplier as deleteSupplierAction,
  getAllSuppliers,
  updateSupplier as updateSupplierAction,
} from "@/lib/actions/supplier.actions";

export const MODEL_KEY = ["suppliers"] as const;

type CreateSupplierInput = z.infer<typeof supplierSchema>;

export function useSupplierQuery() {
  const { onClose } = useSupplierUIStore();

  const genericQuery: ReturnType<
    typeof createGenericQuery<Supplier, CreateSupplierInput>
  > = createGenericQuery<Supplier, CreateSupplierInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllSuppliers();
      },
      insert: async (data: CreateSupplierInput) => {
        return await createSupplierAction(data);
      },
      update: async (id: string, data: Partial<Supplier>) => {
        const result = await updateSupplierAction(id, data as any);
        if (!result.success) {
          throw new Error(result.error || "Failed to update supplier");
        }
        return result as ActionResponse<Supplier>;
      },
      delete: async (id: string) => {
        const result = await deleteSupplierAction(id);
        if (!result.success) {
          throw new Error(result.error || "Failed to delete supplier");
        }
        return result as ActionResponse<Supplier>;
      },
    },
    {
      onClose,
      successMessage: "Supplier created successfully",
      errorMessage: "Failed to create supplier",
      deleteSuccessMessage: "Supplier deleted successfully",
      deleteErrorMessage: "Failed to delete supplier",
      updateSuccessMessage: "Supplier updated successfully",
      updateErrorMessage: "Failed to update supplier",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: suppliers,
    isLoading,
    error,
    createItem: createSupplier,
    updateItem: updateSupplier,
    deleteItem: deleteSupplier,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    suppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    isCreating,
    refresh,
  };
}
