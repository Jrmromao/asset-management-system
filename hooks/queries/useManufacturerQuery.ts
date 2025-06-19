import { createGenericQuery, CrudActions } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { manufacturerSchema } from "@/lib/schemas";
import {
  getAllManufacturers,
  createManufacturer,
  deleteManufacturer,
  updateManufacturer,
} from "@/lib/actions/manufacturer.actions";
import { useManufacturerUIStore } from "@/lib/stores/useManufacturerUIStore";
import { cookies } from "next/headers";

export const MANUFACTURER_KEY = ["manufacturer"] as const;

type CreateManufacturerInput = z.infer<typeof manufacturerSchema>;
type ActionResponse<T> = {
  data?: T;
  error?: string;
  success: boolean;
};

const manufacturerActions: CrudActions<
  Manufacturer,
  CreateManufacturerInput,
  Partial<CreateManufacturerInput>
> = {
  getAll: getAllManufacturers,
  insert: createManufacturer,
  delete: deleteManufacturer,
  update: updateManufacturer,
};

export function useManufacturerQuery() {
  const { onClose } = useManufacturerUIStore();

  const genericQuery = createGenericQuery<
    Manufacturer,
    CreateManufacturerInput,
    Partial<CreateManufacturerInput>
  >(
    MANUFACTURER_KEY,
    manufacturerActions,
    {
      onClose,
      successMessage: "Operation completed successfully",
      errorMessage: "Operation failed",
      updateSuccessMessage: "Manufacturer updated successfully",
      updateErrorMessage: "Failed to update manufacturer",
      deleteSuccessMessage: "Manufacturer deleted successfully",
      deleteErrorMessage: "Failed to delete manufacturer",
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const {
    items: manufacturers,
    isLoading,
    error,
    createItem: createManufacturer,
    updateItem: updateManufacturer,
    deleteItem: deleteManufacturer,
    isUpdating,
    isCreating,
    isDeleting,
    refresh,
  } = genericQuery();

  return {
    manufacturers,
    isLoading,
    error,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
    isDeleting,
    isUpdating,
    isCreating,
    refresh,
  };
}
