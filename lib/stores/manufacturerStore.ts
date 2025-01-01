import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { getAll } from "@/lib/actions/manufacturer.actions";

interface IManufacturerStore {
  // State
  manufacturers: Manufacturer[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  onOpen: () => void;
  onClose: () => void;
  getAll: (params?: { search?: string }) => Promise<void>;
  setManufacturers: (manufacturers: Manufacturer[]) => void;
  clearError: () => void;
}

export const useManufacturerStore = create(
  persist<IManufacturerStore>(
    (set) => ({
      // Initial state
      manufacturers: [],
      isOpen: false,
      isLoading: false,
      error: null,

      // Actions
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),

      getAll: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const result = await getAll(params);

          if (result.error) {
            set({ error: result.error });
            toast.error(result.error);
            return;
          }

          if (result.data) {
            set({ manufacturers: result.data });
          }
        } catch (error) {
          const errorMessage = "Failed to fetch manufacturers";
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch manufacturers",
          });
          toast.error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      setManufacturers: (manufacturers) => {
        set({ manufacturers });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "manufacturer-store",
    },
  ),
);
