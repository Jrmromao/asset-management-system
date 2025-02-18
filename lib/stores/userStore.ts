import { create } from "zustand";
import { persist } from "zustand/middleware";
import produce from "immer";
import { getAll, registerUser, remove } from "@/lib/actions/user.actions";

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
        getAll()
          .then((users) => {
            set({ users: users.data, loading: false });
          })
          .catch((error) => {
            set({ users: [], loading: false });
            console.error("Error fetching users:", error);
          });
      },
      create: async (data: User) => {
        try {
          await registerUser({
            email: data.email,
            password: "",
            firstName: data.firstName,
            lastName: data.lastName,
            companyId: data.companyId!,
            title: data.title,
            employeeId: data.employeeId,
          });

          set(
            produce((state) => {
              state.users.push(data);
            }),
          );
        } catch (error) {
          console.error("Error creating user:", error);
          throw error;
        }
      },

      delete: (id: string) => {
        set(
          produce((state) => {
            remove(id)
              .then(() => {
                state.users = state.users.filter((a: User) => a.id !== id);
              })
              .catch((error) => console.error(error));
          }),
        );
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
