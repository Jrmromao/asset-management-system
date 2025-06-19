import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import {
  getAllLocations,
  createLocation,
  deleteLocation,
  updateLocation,
} from "@/lib/actions/location.actions";

export const MODEL_KEY = ["locations"] as const;

type CreateLocationInput = z.infer<typeof locationSchema>;
type GenericQueryType = ReturnType<typeof createGenericQuery<DepartmentLocation, CreateLocationInput>>;

export function useLocationQuery() {
  const { onClose } = useLocationUIStore();

  const genericQuery: GenericQueryType = createGenericQuery<DepartmentLocation, CreateLocationInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllLocations();
      },
      insert: async (data: CreateLocationInput) => {
        return await createLocation(data);
      },
      delete: async (id: string) => {
        return await deleteLocation(id);
      },
      update: async (id: string, data: CreateLocationInput) => {
        return await updateLocation(id, data as any);
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
    isUpdating,
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
    isUpdating,
    refresh,
  };
}
