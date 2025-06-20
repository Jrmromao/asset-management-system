import { useLocationUIStore } from "@/lib/stores/useLocationUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { locationSchema } from "@/lib/schemas";
import {
  getAllLocations,
  createLocation as createLocationAction,
  deleteLocation as deleteLocationAction,
  updateLocation as updateLocationAction,
} from "@/lib/actions/location.actions";

export const MODEL_KEY = ["locations"] as const;

type CreateLocationInput = z.infer<typeof locationSchema>;

export function useLocationQuery() {
  const { onClose } = useLocationUIStore();

  const genericQuery = createGenericQuery<
    DepartmentLocation,
    CreateLocationInput,
    CreateLocationInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllLocations();
      },
      insert: async (data: CreateLocationInput) => {
        return await createLocationAction(data);
      },
      delete: async (id: string) => {
        return await deleteLocationAction(id);
      },
      update: async (id: string, data: CreateLocationInput) => {
        return await updateLocationAction(id, data);
      },
    },
    {
      onClose,
      successMessage: "Location created successfully",
      updateSuccessMessage: "Location updated successfully",
      deleteSuccessMessage: "Location deleted successfully",
      errorMessage: "Failed to create location",
      updateErrorMessage: "Failed to update location",
      deleteErrorMessage: "Failed to delete location",
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
