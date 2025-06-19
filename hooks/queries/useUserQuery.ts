import { useUserUIStore } from "@/lib/stores/useUserUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { userSchema } from "@/lib/schemas";

export const MODEL_KEY = ["users"] as const;
type CreateModelInput = z.infer<typeof userSchema>;

export function useUserQuery() {
  const { onClose } = useUserUIStore();

  const genericQuery = createGenericQuery<User, CreateModelInput>(
    MODEL_KEY,
    {
      getAll: async () => {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      },
      insert: async (data: CreateModelInput) => {
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to create user');
        }
        return response.json();
      },
      update: async (id: string, data: Partial<CreateModelInput>) => {
        const response = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error('Failed to update user');
        }
        return response.json();
      },
      delete: async (id: string) => {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete user');
        }
        return response.json();
      },
      findById: async (id: string) => {
        const response = await fetch(`/api/users/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return response.json();
      },
    },
    {
      onClose,
      successMessage: "User created successfully",
      errorMessage: "Failed to create user",
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
