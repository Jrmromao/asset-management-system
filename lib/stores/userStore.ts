import { create } from "zustand";
import { persist } from "zustand/middleware";
import produce from "immer";
import { createUser, getAll, remove } from "@/lib/actions/user.actions";

interface IUserStore {
  users: User[];
  loading: boolean;
  create: (user: User) => void;
  // update: (id: string, updatedUser: User) => void;
  findById: (id: string) => User | null;
  delete: (id: string) => void;
  getAll: () => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useUserStore = create(
  persist<IUserStore>(
    (set, get) => ({
      users: [],
      loading: false,

      getAll: async () => {
        set({ loading: true });
        try {
          const result = await getAll();
          if (result.success && result.data) {
            set({ users: result.data, loading: false });
          } else {
            set({ users: [], loading: false });
            console.error("Error fetching users:", result.error);
          }
        } catch (error) {
          set({ users: [], loading: false });
          console.error("Error fetching users:", error);
        }
      },

      create: async (data: User) => {
        try {
          const result = await createUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            companyId: data.companyId!,
            title: data.title,
            employeeId: data.employeeId,
            roleId: data.roleId!,
          });

          if (result.success && result.data) {
            set(
              produce((state) => {
                state.users.push(result.data);
              }),
            );
          } else {
            throw new Error(result.error || "Failed to create user");
          }
        } catch (error) {
          console.error("Error creating user:", error);
          throw error;
        }
      },

      delete: async (id: string) => {
        try {
          const result = await remove(id);
          if (result.success) {
            set(
              produce((state) => {
                state.users = state.users.filter(
                  (user: User) => user.id !== id,
                );
              }),
            );
          } else {
            throw new Error(result.error || "Failed to delete user");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          throw error;
        }
      },

      findById: (id: string) => {
        const user = get().users.find((user) => user.id === id);
        if (!user) return null;
        return user;
      },

      isOpen: false,
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
    }),
    { name: "user_store" },
  ),
);
