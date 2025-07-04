import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAll,
  getAllUsersWithService,
  getUserById,
  remove as deleteUserAction,
  updateUserNonAuthDetails,
} from "@/lib/actions/user.actions";
import { inviteUserSecure } from "@/lib/actions/invitation.actions";
import { toast } from "react-hot-toast";
import { User } from "@prisma/client";

export const useUserQuery = () => {
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useQuery<{ users: User[]; totalUsers: number; newThisMonth: number; uniqueRoles: number }, Error>({
    queryKey: ["users"],
    queryFn: async () => {
      console.log("🔍 [useUserQuery] Starting query...");
      const result = await getAllUsersWithService();
      console.log("🔍 [useUserQuery] Query result:", {
        success: result.success,
        hasData: !!result.data,
        totalUsers: result.data.totalUsers,
        newThisMonth: result.data.newThisMonth,
        uniqueRoles: result.data.uniqueRoles,
        error: result.error
      });
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch users");
      }
      return result.data;
    },
  });

  // Extract users array for backward compatibility
  const users = usersData?.users || [];

  const { mutateAsync: inviteUser, isPending: isInviting } = useMutation({
    mutationFn: inviteUserSecure,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User invitation sent successfully");
      } else {
        toast.error(`Failed to invite user: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to invite user: ${error.message}`);
    },
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      updateUserNonAuthDetails(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast.success("User updated successfully");
      } else {
        toast.error(`Failed to update user: ${result.error}`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
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

  // Add deactivateUser mutation
  const { mutateAsync: deactivateUser, isPending: isDeactivating } = useMutation({
    mutationFn: async ({ userId, actorId, companyId }: { userId: string; actorId: string; companyId: string }) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate", actorId, companyId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to deactivate user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated and notified!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to deactivate user");
    },
  });

  // Add activateUser mutation
  const { mutateAsync: activateUser, isPending: isActivating } = useMutation({
    mutationFn: async ({ userId, actorId, companyId }: { userId: string; actorId: string; companyId: string }) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "activate", actorId, companyId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to activate user");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User activated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to activate user");
    },
  });

  const findById = async (id: string) => {
    // Always fetch full user details from backend for detail view
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
    inviteUser,
    isInviting,
    updateUser,
    isUpdating,
    refresh: refetch,
    deleteItem,
    deactivateUser,
    isDeactivating,
    activateUser,
    isActivating,
    // Metrics from the enhanced service
    totalUsers: usersData?.totalUsers || 0,
    newThisMonth: usersData?.newThisMonth || 0,
    uniqueRoles: usersData?.uniqueRoles || 0,
  };
};
