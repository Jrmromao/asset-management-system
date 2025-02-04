import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { createTemplateSchema } from "@/lib/schemas";
import {
  getAll,
  insert,
  remove,
  update,
} from "@/lib/actions/formTemplate.actions";
import { FormTemplate } from "@/types/form";

export const MODEL_KEY = ["formTemplates"] as const;

type CreateFormTemplateInput = z.infer<typeof createTemplateSchema>;

export function useFormTemplatesQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<
    FormTemplate,
    CreateFormTemplateInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateFormTemplateInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
      },
      update: async (id: string, data: Partial<FormTemplate>) => {
        return await update(id, data);
      },
    },
    {
      onClose,
      successMessage: "Category created successfully",
      errorMessage: "Failed to create category",
      updateSuccessMessage: "Category updated successfully",
      updateErrorMessage: "Failed to update category",
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  const {
    items: formTemplates,
    isLoading,
    error,
    createItem: createFormTemplate,
    updateItem: updateFormTemplate,
    deleteItem: deleteFormTemplate,
    isUpdating,
    isCreating,
    isDeleting,
    refresh,
  } = genericQuery();

  return {
    formTemplates,
    isLoading,
    error,
    createFormTemplate,
    updateFormTemplate,
    deleteFormTemplate,
    isUpdating,
    isCreating,
    isDeleting,
    refresh,
  };
}
