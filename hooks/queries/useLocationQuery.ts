import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import { getAll, insert, remove, update } from "@/lib/actions/location.actions";

export const MODEL_KEY = ["locations"] as const;

type CreateLocationInput = z.infer<typeof locationSchema>;

export function useLocationQuery() {
  const { onClose } = useLocationUIStore();

  const genericQuery = createGenericQuery<
    DepartmentLocation,
    CreateLocationInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateLocationInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: Partial<DepartmentLocation>) => {
        return await update(id, data);
      },
    },
    {
      onClose,
      successMessage: "Location created successfully",
      errorMessage: "Failed to create location",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: locations,
    isLoading,
    error,
    createItem: createLocation,
    updateItem: updateLocation,
    deleteItem: deleteLocation,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    locations,
    isLoading,
    error,
    updateLocation,
    createLocation,
    deleteLocation,
    isCreating,
    refresh,
  };
}
