import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { manufacturerSchema } from "@/lib/schemas";
import { getAll, insert, remove } from "@/lib/actions/manufacturer.actions";
import { useManufacturerUIStore } from "@/lib/stores/useManufacturerUIStore";

export const MODEL_KEY = ["manufacturer"] as const;

type CreateManufacturerInput = z.infer<typeof manufacturerSchema>;

export function useManufacturerQuery() {
  const { onClose } = useManufacturerUIStore();

  const genericQuery = createGenericQuery<
    Manufacturer,
    CreateManufacturerInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateManufacturerInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
    },
    {
      onClose,
      successMessage: "Manufacturer created successfully",
      errorMessage: "Failed to create manufacturer",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: manufacturers,
    isLoading,
    error,
    createItem: createManufacturer,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    manufacturers,
    isLoading,
    error,
    createManufacturer,
    isCreating,
    refresh,
  };
}
