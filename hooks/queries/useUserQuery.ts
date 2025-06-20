import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAll,
  createUser as createUserAction,
  getUserById,
  remove as deleteUserAction,
} from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { User } from "@prisma/client";

export const useUserQuery = () => {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await getAll();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch users");
      }
      return result.data as User[];
    },
  });

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: createUserAction,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User created successfully");
      } else {
        toast.error(`Failed to create user: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const { mutateAsync: deleteItem } = useMutation({
    mutationFn: (id: string) => deleteUserAction(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User deleted successfully");
      } else {
        toast.error(`Failed to delete user: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const findById = async (id: string) => {
    const user = users.find((user: User) => user.id === id);
    if (user) return user;

    const result = await getUserById(id);
    if (result.success && result.data) {
      return result.data;
    }

    return undefined;
  };

  return {
    users,
    isLoading,
    error,
    findById,
    createUser,
    isCreating,
    refresh: refetch,
    deleteItem,
  };
};
