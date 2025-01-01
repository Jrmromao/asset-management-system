import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRoles } from "@/lib/actions/role.actions";

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
        getRoles()
          .then((roles) => {
            set({ roles: roles.data });
          })
          .catch((error) => {
            set({ roles: [], loading: false });
            console.error("Error fetching assets:", error);
            set({ loading: false });
          });
      },

      // create: async (role: Role) => {
      //     try {
      //         await insert(role).then(_ => {
      //         })
      //         set(
      //             produce((state) => {
      //                 state.roles.push(role);
      //             })
      //         );
      //         return role;
      //     } catch (error) {
      //         console.error("Error creating asset:", error);
      //         throw error;
      //     }
      // },

      findById: (id: string) => {
        const role = get().roles.find((asset) => asset.id === id);
        if (!role) return null;
        return role;
      },
    }),
    { name: "role_store" },
  ),
);
