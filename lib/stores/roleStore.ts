import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll } from "@/lib/actions/role.actions";

interface IAssetStore {
  roles: Role[];
  loading: boolean;
  // create: (role: Role) => void;
  getAll: () => void;
}

export const useRoleStore = create(
  persist<IAssetStore>(
    (set, get) => ({
      roles: [],
      loading: false,

      getAll: async () => {
        set({ loading: true });
        getAll()
          .then((roles: any) => {
            set({ roles: roles.data });
          })
          .catch((error) => {
            set({ roles: [], loading: false });
            console.error("Error fetching roles:", error);
            set({ loading: false });
          });
      },

      findById: (id: string) => {
        const role = get().roles.find((asset) => asset.id === id);
        if (!role) return null;
        return role;
      },
    }),
    { name: "role_store" },
  ),
);
