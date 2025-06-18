import { useSupplierUIStore } from "@/lib/stores/useSupplierUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { supplierSchema } from "@/lib/schemas";
import { getAll, insert, remove, update } from "@/lib/actions/supplier.actions";

export const MODEL_KEY = ["suppliers"] as const;

type CreateSupplierInput = z.infer<typeof supplierSchema>;

export function useSupplierQuery() {
  const { onClose } = useSupplierUIStore();

  const genericQuery = createGenericQuery<Supplier, CreateSupplierInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateSupplierInput) => {
        return await insert(data);
      },
      update: async (id: string, data: Partial<Supplier>) => {
        const result = await update(id, data as any);
        return result as ActionResponse<Supplier>;
      },
      delete: async (id: string) => {
        return await remove(id);
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
