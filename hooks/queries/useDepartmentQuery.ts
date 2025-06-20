import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { departmentSchema } from "@/lib/schemas";
import {
  getAllDepartments,
  createDepartment as createDepartmentAction,
  deleteDepartment as deleteDepartmentAction,
  updateDepartment as updateDepartmentAction,
} from "@/lib/actions/department.actions";
import { useDepartmentUIStore } from "@/lib/stores/useDepartmentUIStore";

export const MODEL_KEY = ["departments"] as const;

type CreateDepartmentInput = z.infer<typeof departmentSchema>;

export function useDepartmentQuery() {
  const { onClose } = useDepartmentUIStore();

  const genericQuery = createGenericQuery<Department, CreateDepartmentInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAllDepartments();
      },
      insert: async (data: CreateDepartmentInput) => {
        return await createDepartmentAction(data);
      },
      delete: async (id: string) => {
        return await deleteDepartmentAction(id);
      },
      update: async (id: string, data: CreateDepartmentInput) => {
        return await updateDepartmentAction(id, data);
      },
    },
    {
      onClose,
      successMessage: "Department created successfully",
      updateSuccessMessage: "Department updated successfully",
      deleteSuccessMessage: "Department deleted successfully",
      errorMessage: "Failed to create department",
      updateErrorMessage: "Failed to update department",
      deleteErrorMessage: "Failed to delete department",
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
    isDeleting,
    isUpdating,
    refresh,
  } = genericQuery();

  return {
    departments,
    isLoading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isDeleting,
    isUpdating,
    refresh,
  };
}
