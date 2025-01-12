import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import { getAll, insert, removeCat } from "@/lib/actions/location.actions";

export const MODEL_KEY = ["users"] as const;

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
        return await removeCat(id);
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
    isCreating,
    refresh,
  } = genericQuery();

  return {
    locations,
    isLoading,
    error,
    createLocation,
    isCreating,
    refresh,
  };
}
