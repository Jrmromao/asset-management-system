import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll, insert, update, remove, findById } from "@/lib/actions/location.actions";
import { toast } from "sonner";

// Types that match your schema exactly
interface Location {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  createLocation: (data: CreateLocationDTO) => Promise<void>;
  updateLocation: (id: string, data: UpdateLocationDTO) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  getLocationById: (id: string) => Promise<void>;
  
  // Search and Filter
  searchLocations: (query: string) => void;
  filterLocationsByCity: (city: string) => void;
  filterLocationsByState: (state: string) => void;
  filterLocationsByCountry: (country: string) => void;
  resetFilters: () => Promise<void>;
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

      createLocation: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const result = await insert(data);
          
          if (result.error) {
            // Handle unique constraint violation
            if (result.error.includes('already exists')) {
              set({ error: 'A location with this name already exists in your company' });
              toast.error('Location name must be unique');
              return;
            }
            set({ error: result.error });
            toast.error(result.error);
            return;
          }

          set((state) => ({
            locations: [...state.locations, result.data!],
            isOpen: false
          }));
          
          toast.success('Location created successfully');
        } catch (error) {
          set({ error: 'Failed to create location' });
          toast.error('Failed to create location');
        } finally {
          set({ isLoading: false });
        }
      },

      updateLocation: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const result = await update(data, id);
          
          if (result.error) {
            // Handle unique constraint violation
            if (result.error.includes('already exists')) {
              set({ error: 'A location with this name already exists in your company' });
              toast.error('Location name must be unique');
              return;
            }
            set({ error: result.error });
            toast.error(result.error);
            return;
          }

          set((state) => ({
            locations: state.locations.map((location) =>
              location.id === id ? { ...location, ...result.data } : location
            ),
            selectedLocation: null,
            isOpen: false
          }));
          
          toast.success('Location updated successfully');
        } catch (error) {
          set({ error: 'Failed to update location' });
          toast.error('Failed to update location');
        } finally {
          set({ isLoading: false });
        }
      },

      deleteLocation: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const result = await remove(id);
          
          if (result.error) {
            set({ error: result.error });
            toast.error(result.error);
            return;
          }

          set((state) => ({
            locations: state.locations.filter((location) => location.id !== id),
            selectedLocation: null
          }));
          
          toast.success('Location deleted successfully');
        } catch (error) {
          set({ error: 'Failed to delete location' });
          toast.error('Failed to delete location');
        } finally {
          set({ isLoading: false });
        }
      },

      getLocationById: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const result = await findById(id);
          
          if (result.error) {
            set({ error: result.error });
            return;
          }

          set({ selectedLocation: result.data || null });
        } catch (error) {
          set({ error: 'Failed to fetch location' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Search and Filter Actions
      searchLocations: (query) => {
        const { locations } = get();
        if (!query) {
          get().fetchLocations();
          return;
        }

        const filtered = locations.filter(
          (location) =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.city.toLowerCase().includes(query.toLowerCase()) ||
            location.state.toLowerCase().includes(query.toLowerCase()) ||
            location.country.toLowerCase().includes(query.toLowerCase())
        );

        set({ locations: filtered });
      },

      filterLocationsByCity: (city) => {
        const { locations } = get();
        if (!city) return;

        const filtered = locations.filter(
          (location) => location.city.toLowerCase() === city.toLowerCase()
        );
        set({ locations: filtered });
      },

      filterLocationsByState: (state) => {
        const { locations } = get();
        if (!state) return;

        const filtered = locations.filter(
          (location) => location.state.toLowerCase() === state.toLowerCase()
        );
        set({ locations: filtered });
      },

      filterLocationsByCountry: (country) => {
        const { locations } = get();
        if (!country) return;

        const filtered = locations.filter(
          (location) => location.country.toLowerCase() === country.toLowerCase()
        );
        set({ locations: filtered });
      },

      resetFilters: async () => {
        await get().fetchLocations();
      }
    }),
    {
      name: 'location-store',
    }
  )
);
