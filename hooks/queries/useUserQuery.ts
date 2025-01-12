import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { userSchema } from "@/lib/schemas";
import {
  createUser as insert,
  getAll,
  remove,
} from "@/lib/actions/user.actions";

export const MODEL_KEY = ["users"] as const;

type CreateModelInput = z.infer<typeof userSchema>;

export function useUserQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<User, CreateModelInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        return await getAll();
      },
      insert: async (data: CreateModelInput) => {
        return await insert(data);
      },
      delete: async (id: string) => {
        return await remove(id);
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
    items: users,
    isLoading,
    error,
    createItem: createUser,
    isCreating,
    refresh,
  } = genericQuery();

  return {
    users,
    isLoading,
    error,
    createUser,
    isCreating,
    refresh,
  };
}
