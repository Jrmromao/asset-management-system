import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMaintenanceTypes,
  createMaintenanceType,
  updateMaintenanceType,
  deleteMaintenanceType,
  getMaintenanceCategories,
  createMaintenanceCategory,
  updateMaintenanceCategory,
  deleteMaintenanceCategory,
  type MaintenanceType,
  type MaintenanceCategory,
  type CreateMaintenanceTypeParams,
  type CreateMaintenanceCategoryParams,
} from "@/lib/actions/maintenanceType.actions";

export const MAINTENANCE_TYPE_QUERY_KEYS = {
  all: ["maintenance-types"] as const,
  lists: () => [...MAINTENANCE_TYPE_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...MAINTENANCE_TYPE_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...MAINTENANCE_TYPE_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...MAINTENANCE_TYPE_QUERY_KEYS.details(), id] as const,
};

export const MAINTENANCE_CATEGORY_QUERY_KEYS = {
  all: ["maintenance-categories"] as const,
  lists: () => [...MAINTENANCE_CATEGORY_QUERY_KEYS.all, "list"] as const,
  details: () => [...MAINTENANCE_CATEGORY_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) =>
    [...MAINTENANCE_CATEGORY_QUERY_KEYS.details(), id] as const,
};

// MAINTENANCE CATEGORIES HOOKS

export function useMaintenanceCategories() {
  return useQuery({
    queryKey: MAINTENANCE_CATEGORY_QUERY_KEYS.lists(),
    queryFn: async () => {
      const response = await fetch("/api/maintenance-categories");
      if (!response.ok) {
        throw new Error("Failed to fetch maintenance categories");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || "Failed to fetch maintenance categories",
        );
      }
      return result.data;
    },
  });
}

export function useCreateMaintenanceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceCategoryParams) => {
      const response = await fetch("/api/maintenance-categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create maintenance category");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || "Failed to create maintenance category",
        );
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_CATEGORY_QUERY_KEYS.all,
      });
      toast.success("Maintenance category created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create maintenance category");
    },
  });
}

export function useUpdateMaintenanceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateMaintenanceCategoryParams;
    }) => {
      const response = await fetch(`/api/maintenance-categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update maintenance category");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || "Failed to update maintenance category",
        );
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_CATEGORY_QUERY_KEYS.all,
      });
      toast.success("Maintenance category updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update maintenance category");
    },
  });
}

export function useDeleteMaintenanceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/maintenance-categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete maintenance category");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(
          result.error || "Failed to delete maintenance category",
        );
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_CATEGORY_QUERY_KEYS.all,
      });
      toast.success("Maintenance category deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete maintenance category");
    },
  });
}

// MAINTENANCE TYPES HOOKS

export function useMaintenanceTypes(
  filters: { category?: string; isActive?: boolean } = {},
) {
  return useQuery({
    queryKey: MAINTENANCE_TYPE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.isActive !== undefined)
        params.set("isActive", filters.isActive.toString());

      const response = await fetch(
        `/api/maintenance-types?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch maintenance types");
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch maintenance types");
      }
      return result.data;
    },
  });
}

export function useCreateMaintenanceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceTypeParams) => {
      const response = await fetch("/api/maintenance-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create maintenance type");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to create maintenance type");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_TYPE_QUERY_KEYS.all,
      });
      toast.success("Maintenance type created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create maintenance type");
    },
  });
}

export function useUpdateMaintenanceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateMaintenanceTypeParams;
    }) => {
      const response = await fetch(`/api/maintenance-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update maintenance type");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update maintenance type");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_TYPE_QUERY_KEYS.all,
      });
      toast.success("Maintenance type updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update maintenance type");
    },
  });
}

export function useDeleteMaintenanceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/maintenance-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete maintenance type");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to delete maintenance type");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MAINTENANCE_TYPE_QUERY_KEYS.all,
      });
      toast.success("Maintenance type deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete maintenance type");
    },
  });
}
