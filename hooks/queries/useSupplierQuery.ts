import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { supplierSchema } from "@/lib/schemas";
import {
  createSupplier,
  deleteSupplier,
  getAllSuppliers,
  updateSupplier,
} from "@/lib/actions/supplier.actions";

export const MODEL_KEY = ["suppliers"] as const;

type CreateSupplierInput = z.infer<typeof supplierSchema>;

export function useSupplierQuery() {
  const { onClose } = useSupplierUIStore();

  const genericQuery: ReturnType<typeof createGenericQuery<Supplier, CreateSupplierInput>> = createGenericQuery<Supplier, CreateSupplierInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllSuppliers();
      },
      insert: async (data: CreateSupplierInput) => {
        return await createSupplier(data);
      },
      update: async (id: string, data: Partial<Supplier>) => {
        const result = await updateSupplier(id, data as any);
        return result as ActionResponse<Supplier>;
      },
      delete: async (id: string) => {
        return await deleteSupplier(id);
      },
    },
    {
      onClose,
      successMessage: "Supplier created successfully",
      errorMessage: "Failed to create supplier",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: suppliers,
    isLoading,
    error,
    createItem: createSupplier,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    suppliers,
    isLoading,
    error,
    createSupplier,
    isCreating,
    refresh,
  };
}
