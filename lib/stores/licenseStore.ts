import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import { getAll as fetch, remove, update } from "@/lib/actions/license.actions";
import { License } from "../../types/license";

interface ILicenseStore {
  licenses: License[];
  loading: boolean;
  create: (license: License) => void;
  update: (id: string, updatedLicense: License) => void;
  delete: (id: string) => Promise<void>;
  findById: (id: string) => License | null;
  getAll: () => Promise<void>;
}

type LicenseStore = ILicenseStore;

export const useLicenseStore = create(
  persist<LicenseStore>(
    (set, get) => ({
      licenses: [],
      loading: false,

      getAll: async () => {
        set({ loading: true });
        try {
          const result = await fetch();
          if (result.success && result.data) {
            set({ licenses: result.data as License[], loading: false });
          } else {
            set({ licenses: [], loading: false });
            console.error("Error fetching licenses:", result.error);
          }
        } catch (error) {
          set({ licenses: [], loading: false });
          console.error("Error fetching licenses:", error);
        }
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
          console.error("Error creating license:", error);
          throw error;
        }
      },

      update: (id: string, updatedLicense: License) => {
        set(
          produce((state) => {
            update(updatedLicense, id)
              .then(() => {
                const index = state.licenses.findIndex(
                  (license: License) => license.id === id,
                );
                if (index !== -1) {
                  state.licenses[index] = updatedLicense;
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
                (license: License) => license.id !== id,
              );
            }),
          );
        } catch (error) {
          throw error;
        }
      },
    }),
    { name: "license_store" },
  ),
);
