import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import { getAll as fetch, remove } from "@/lib/actions/accessory.actions";

interface AccessoryState {
  accessories: Accessory[];
  loading: boolean;
  isAssignOpen: boolean;
}

interface AccessoryActions {
  // create: (accessory: Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Accessory | null>;
  // update: (id: string, data: Partial<Accessory>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => Accessory | null;
  getAll: () => Promise<void>;
  onAssignOpen: () => void;
  onAssignClose: () => void;
  // unassign: (assetId: string) => Promise<void>;
  // assign: (assetId: string, userId: string) => Promise<void>;
}

type AccessoryStore = AccessoryState & AccessoryActions;

export const useAccessoryStore = create(
  persist<AccessoryStore>(
    (set, get) => ({
      accessories: [],
      loading: false,
      isAssignOpen: false,

      getAll: async () => {
        set({ loading: true });
        fetch()
          .then((response) => {
            set({ accessories: response.data as Accessory[], loading: false });
          })
          .catch((error) => {
            set({ accessories: [], loading: false });
            console.error("Error fetching accessories:", error);
          });

        console.log("AccessoryStore getAll", get().accessories);
      },

      // create: async (accessory) => {
      //     try {
      //         const response = await insert(accessory);
      //         if (response.success && response.data) {
      //             set(
      //                 produce((state: AccessoryState) => {
      //                     state.accessories.push(response.data);
      //                 })
      //             );
      //             return response.data;
      //         }
      //         return null;
      //     } catch (error) {
      //         console.error("Error creating accessory:", error);
      //         return null;
      //     }
      // },

      // update: async (id, data) => {
      //     try {
      //         const response = await updateAccessory(data, id);
      //         if (response.success) {
      //             set(
      //                 produce((state: AccessoryState) => {
      //                     const index = state.accessories.findIndex(accessory => accessory.id === id);
      //                     if (index !== -1) {
      //                         state.accessories[index] = { ...state.accessories[index], ...data };
      //                     }
      //                 })
      //             );
      //         }
      //     } catch (error) {
      //         console.error("Error updating accessory:", error);
      //         throw error;
      //     }
      // },

      delete: async (id) => {
        try {
          const response = await remove(id);
          if (response.success) {
            set(
              produce((state: AccessoryState) => {
                state.accessories = state.accessories.filter(
                  (accessory) => accessory.id !== id,
                );
              }),
            );
          }
        } catch (error) {
          console.error("Error deleting accessory:", error);
          throw error;
        }
      },

      findById: (id) => {
        const accessory = get().accessories.find(
          (accessory) => accessory.id === id,
        );
        return accessory || null;
      },

      onAssignOpen: () => set({ isAssignOpen: true }),

      onAssignClose: () => set({ isAssignOpen: false }),

      // assign: async (assetId, userId) => {
      //     try {
      //         const response = await assignAccessory(assetId, userId);
      //         if (response.success) {
      //             set(
      //                 produce((state: AccessoryState) => {
      //                     const index = state.accessories.findIndex(accessory => accessory.id === assetId);
      //                     if (index !== -1) {
      //                         state.accessories[index] = {
      //                             ...state.accessories[index],
      //                             assignedToId: userId
      //                         };
      //                     }
      //                 })
      //             );
      //         }
      //     } catch (error) {
      //         console.error("Error assigning accessory:", error);
      //         throw error;
      //     }
      // },
      //
      // unassign: async (assetId) => {
      //     try {
      //         const response = await unassignAccessory(assetId);
      //         if (response.success) {
      //             set(
      //                 produce((state: AccessoryState) => {
      //                     const index = state.accessories.findIndex(accessory => accessory.id === assetId);
      //                     if (index !== -1) {
      //                         state.accessories[index] = {
      //                             ...state.accessories[index],
      //                             assignedToId: null
      //                         };
      //                     }
      //                 })
      //             );
      //         }
      //     } catch (error) {
      //         console.error("Error unassigning accessory:", error);
      //         throw error;
      //     }
      // },
    }),
    {
      name: "accessory_store",
    },
  ),
);
