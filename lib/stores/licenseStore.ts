import { create } from "zustand";
import { persist } from "zustand/middleware";
import produce from "immer";
import { getAll, remove, update } from "@/lib/actions/license.actions";

interface ILicenseStore {
  licenses: License[];
  loading: boolean;
  create: (asset: License) => void;
  update: (id: string, updatedAsset: License) => void;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => License | null;
  getAll: () => void;
}

export const useLicenseStore = create(
  persist<ILicenseStore>(
    (set, get) => ({
      licenses: [],
      loading: false,

      getAll: async () => {
        set({ loading: true });
        getAll()
          .then((licenses) => {
            set({ licenses, loading: false });
          })
          .catch((error) => {
            set({ licenses: [], loading: false });
            console.error("Error fetching assets:", error);
          });
      },

      create: async (license: License) => {
        try {
          // await insert(license);
          set(
            produce((state) => {
              state.licenses.push(license);
            }),
          );
          return license;
        } catch (error) {
          console.error("Error creating asset:", error);
          throw error;
        }
      },

      update: (id: string, updatedLicense: License) => {
        set(
          produce((state) => {
            update(updatedLicense, id)
              .then(() => {
                const index = state.assets.findIndex(
                  (asset: Asset) => asset.id === id,
                );
                if (index !== -1) {
                  state.assets[index] = updatedLicense;
                }
              })
              .catch((error) => console.log(error));
          }),
        );
      },

      findById: (id: string) => {
        const license = get().licenses.find((license) => license.id === id);
        if (!license) return null;

        return license;
      },

      delete: async (id: string) => {
        try {
          await remove(id);
          set(
            produce((state) => {
              state.licenses = state.licenses?.filter(
                (a: Asset) => a.id !== id,
              );
            }),
          );
        } catch (error) {
          throw error;
        }
      },
    }),
    { name: "asset_store" },
  ),
);
