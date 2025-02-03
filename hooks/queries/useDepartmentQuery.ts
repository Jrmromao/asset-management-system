import {
  getAll,
  insert,
  remove,
  update,
} from "@/lib/actions/department.actions";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { departmentSchema } from "@/lib/schemas";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";

export const MODEL_KEY = ["departments"] as const;

type CreateDepartmentInput = z.infer<typeof departmentSchema>;

export function useDepartmentQuery() {
  const { onClose } = useDepartmentUIStore();

  const genericQuery = createGenericQuery<Department, CreateDepartmentInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateDepartmentInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: Partial<Department>) => {
        return await update(id, data);
      },
    },
    {
      onClose,
      successMessage: "Departments created successfully",
      errorMessage: "Failed to create departments",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: departments,
    isLoading,
    error,
    createItem: createDepartment,
    updateItem: updateDepartment,
    deleteItem: deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
    refresh,
  } = genericQuery();

  return {
    departments,
    isLoading,
    error,
    updateDepartment,
    createDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
    refresh,
  };
}
