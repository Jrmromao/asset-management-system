import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { userSchema } from "@/lib/schemas";
import {
  createUser as insert,
  findById,
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
      getAll: async () => await getAll(),
      insert: async (data: CreateModelInput) => await insert(data),
      delete: async (id: string) => await remove(id),
      findById: async (id: string) => await findById(id),
    },
    {
      onClose,
      successMessage: "Model created successfully",
      errorMessage: "Failed to create model",
      staleTime: 5 * 60 * 1000,
    },
  );

  const {
    items: users,
    isLoading,
    error,
    createItem: createUser,
    isCreating,
    refresh,
    findById: queryFindById,
  } = genericQuery();

  return {
    users,
    isLoading,
    error,
    findById: queryFindById,
    createUser,
    isCreating,
    refresh,
  };
}
