import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll, insert, update, remove, findById } from "@/lib/actions/location.actions";
import { toast } from "sonner";


type CreateLocationDTO = Omit<Location, "id" | "createdAt" | "updatedAt" | "companyId">;
type UpdateLocationDTO = Partial<CreateLocationDTO>;

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
    (set, get) => ({
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
          
          if (result.error) {
            set({ error: result.error });
            return;
          }

          set({ locations: result.data || [] });
        } catch (error) {
          set({ error: 'Failed to fetch locations' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'location-store',
    }
  )
);
