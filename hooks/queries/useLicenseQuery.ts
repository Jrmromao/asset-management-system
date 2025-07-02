import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { licenseSchema } from "@/lib/schemas";
import {
  create as insert,
  getAll,
  remove,
  update,
  checkin,
  checkout,
  findById,
  getAllForStats,
} from "@/lib/actions/license.actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const MODEL_KEY = ["licenses"] as const;

type CreateLicenseInput = z.infer<typeof licenseSchema>;

export function useLicenseQuery(pageIndex = 0, pageSize = 10, searchTerm = "", filters: any = {}) {
  const { onClose } = useUserUIStore();
  const queryClient = useQueryClient();

  const genericQuery = createGenericQuery<License, CreateLicenseInput>(
    [
      ...MODEL_KEY,
      pageIndex,
      pageSize,
      searchTerm,
      JSON.stringify(filters),
    ],
    {
      getAll: async () => {
        const result = await getAll(pageIndex, pageSize, searchTerm, filters);
        // The query factory will handle paginated response
        return result;
      },
      insert: async (data: CreateLicenseInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: CreateLicenseInput) => {
        return await update(data, id);
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
    total: totalCount = 0,
  } = genericQuery();

  // Single license query
  const useLicense = (id: string) =>
    useQuery({
      queryKey: ["license", id],
      queryFn: () => findById(id),
      staleTime: 5 * 60 * 1000,
    });

  // Mutations
  const checkinMutation = useMutation({
    mutationFn: (userLicenseId: string) => checkin(userLicenseId),
    onSuccess: (_data, userLicenseId) => {
      queryClient.invalidateQueries({ queryKey: ["license", userLicenseId] });
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (values: any) => checkout(values),
    onSuccess: (_data, values) => {
      const licenseId = values.licenseId || values.itemId;
      if (licenseId) {
        queryClient.invalidateQueries({ queryKey: ["license", licenseId] });
      }
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });

  return {
    licenses,
    isLoading,
    error,
    deleteItem,
    createLicense,
    isCreating,
    refresh,
    updateLicense: genericQuery().updateItem,
    useLicense, // for single license
    checkin: checkinMutation.mutateAsync,
    checkout: checkoutMutation.mutateAsync,
    total: totalCount,
  };
}

export function useAllLicensesForStats() {
  const { onClose } = useUserUIStore();
  return useQuery({
    queryKey: ["licenses", "all-for-stats"],
    queryFn: async () => {
      const result = await getAllForStats();
      if (result.error) throw new Error(result.error);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
