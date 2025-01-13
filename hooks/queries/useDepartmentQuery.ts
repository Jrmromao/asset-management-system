import { getAll, insert, remove } from "@/lib/actions/department.actions";
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
    isCreating,
    refresh,
  } = genericQuery();

  return {
    departments,
    isLoading,
    error,
    createDepartment,
    isCreating,
    refresh,
  };
}
