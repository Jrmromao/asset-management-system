import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { categorySchema } from "@/lib/schemas";
import { getAll, insert, remove, update } from "@/lib/actions/category.actions";

export const MODEL_KEY = ["categories"] as const;

type CreateCategoryInput = z.infer<typeof categorySchema>;

export function useCategoryQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<Category, CreateCategoryInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        const result = await getAll();
        return result as ActionResponse<Category[]>;
      },
      insert: async (data: CreateCategoryInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        const result = await remove(id);
        return result as ActionResponse<Category>;
      },
      update: async (id: string, data: Partial<CreateCategoryInput>) => {
        return await update(id, data as Category);
      },
    },
    {
      onClose,
      successMessage: "Model created successfully",
      errorMessage: "Failed to create model",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: categories,
    isLoading,
    error,
    createItem: createCategory,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    categories,
    isLoading,
    error,
    createCategory,
    isCreating,
    refresh,
  };
}
