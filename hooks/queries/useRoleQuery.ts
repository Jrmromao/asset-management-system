import { useRoleUIStore } from "@/lib/stores/useRoleUIStore";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import { z } from "zod";
import { roleSchema } from "@/lib/schemas";
import { Role } from "@prisma/client";

export const MODEL_KEY = ["roles"] as const;

type CreateRoleInput = z.infer<typeof roleSchema>;

// Define the ActionResponse interface to match what the factory expects
interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useRoleQuery() {
  const { onClose } = useRoleUIStore();

  const genericQuery = createGenericQuery<Role, CreateRoleInput>(
    MODEL_KEY,
    {
      getAll: async (): Promise<ActionResponse<Role[]>> => {
        const response = await fetch("/api/roles");
        if (!response.ok) {
          throw new Error("Failed to fetch roles");
        }
        const result = await response.json();
        return result;
      },
      insert: async (data: CreateRoleInput): Promise<ActionResponse<Role>> => {
        const response = await fetch("/api/roles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error("Failed to create role");
        }
        const result = await response.json();
        return result;
      },
      delete: async (id: string): Promise<ActionResponse<Role>> => {
        const response = await fetch(`/api/roles/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete role");
        }
        const result = await response.json();
        return result;
      },
      update: async (id: string, data: Partial<CreateRoleInput>): Promise<ActionResponse<Role>> => {
        const response = await fetch(`/api/roles/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          throw new Error("Failed to update role");
        }
        const result = await response.json();
        return result;
      },
    },
    {
      onClose,
      successMessage: "Role created successfully",
      errorMessage: "Failed to create role",
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