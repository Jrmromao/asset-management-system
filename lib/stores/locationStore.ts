import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll } from "@/lib/actions/location.actions";

interface LocationStore {
  // State
  locations: Location[];
  selectedLocation: Location | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // UI Actions
  onOpen: () => void;
  onClose: () => void;
  clearError: () => void;

  // Data Actions
  fetchLocations: () => Promise<void>;
}

export const useLocationStore = create(
  persist<LocationStore>(
    (set) => ({
      // Initial State
      locations: [],
      selectedLocation: null,
      isOpen: false,
      isLoading: false,
      error: null,

      // UI Actions
      onOpen: () => set({ isOpen: true }),
      onClose: () => {
        set({ isOpen: false, error: null });
      },
      clearError: () => set({ error: null }),

      // Data Actions
      fetchLocations: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await getAll();
          set({ locations: result.data || [] });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch locations",
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "location-store",
    },
  ),
);
