import { useRoleUIStore } from "@/lib/stores/useRoleUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { roleSchema } from "@/lib/schemas";
import { getAll, insert, remove, update } from "@/lib/actions/role.actions";

export const MODEL_KEY = ["roles"] as const;

type CreateRoleInput = z.infer<typeof roleSchema>;

export function useRoleQuery() {
  const { onClose } = useRoleUIStore();

  const genericQuery = createGenericQuery<Role, CreateRoleInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateRoleInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return remove(id);
      },
      update: async (id: string, data: Partial<CreateRoleInput>) => {
        return await update(id, data as Role);
      },
    },
    {
      onClose,
      successMessage: "",
      errorMessage: "",
    },
  );

  const {
    items: roles,
    isLoading,
    error,
    createItem: createModel,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    roles,
    isLoading,
    error,
    createModel,
    isCreating,
    refresh,
  };
}
