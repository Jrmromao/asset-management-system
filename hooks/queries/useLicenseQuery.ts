import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { licenseSchema } from "@/lib/schemas";
import {
  create as insert,
  getAll,
  remove,
} from "@/lib/actions/license.actions";

export const MODEL_KEY = ["licenses"] as const;

type CreateLicenseInput = z.infer<typeof licenseSchema>;

export function useLicenseQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<License, CreateLicenseInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateLicenseInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
    },
    {
      onClose,
      successMessage: "License created successfully",
      errorMessage: "Failed to create license",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: licenses,
    isLoading,
    error,
    createItem: createLicense,
    isCreating,
    refresh,
    deleteItem,
  } = genericQuery();

  return {
    licenses,
    isLoading,
    error,
    deleteItem,
    createLicense,
    isCreating,
    refresh,
  };
}
