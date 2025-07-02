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
    any,
    CreateFormTemplateInput
  >(
    MODEL_KEY,
    {
      getAll: async () => {
        const result = await getAll();
        if (result.success && result.data) {
          result.data = result.data.map(item => ({
            ...item,
            fields: Array.isArray(item.fields) ? item.fields as any[] : []
          }));
        }
        return result;
      },
      insert: async (data: CreateFormTemplateInput) => {
        const { fields, ...rest } = data;
        const transformedData = {
          ...rest,
          fields: fields ? JSON.parse(JSON.stringify(fields)) : []
        };
        const result = await insert(transformedData as any);
        if (result.success && result.data) {
          result.data = {
            ...result.data,
            fields: Array.isArray(result.data.fields) ? result.data.fields as any[] : []
          };
        }
        return result;
      },
      delete: async (id: string) => {
        const result = await remove(id);
        if (result.success && result.data) {
          result.data = {
            ...result.data,
            fields: Array.isArray(result.data.fields) ? result.data.fields as any[] : []
          };
        }
        return result;
      },
      update: async (id: string, data: Partial<FormTemplate>) => {
        const { fields, ...rest } = data;
        const transformedData = {
          ...rest,
          ...(fields ? { fields: JSON.parse(JSON.stringify(fields)) } : {})
        };
        const result = await update(id, transformedData as any);
        if (result.success && result.data) {
          result.data = {
            ...result.data,
            fields: Array.isArray(result.data.fields) ? result.data.fields as any[] : []
          };
        }
        return result;
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
