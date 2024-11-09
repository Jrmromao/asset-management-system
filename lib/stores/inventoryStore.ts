import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll } from "@/lib/actions/inventory.actions";


interface IInventoryStore {
    isOpen: boolean;
    inventories: Inventory[];
    loading: boolean;
    isAssignOpen: boolean;
    error: string | null;
    getAll: (options?: {
        orderBy?: 'name' | 'createdAt';
        order?: 'asc' | 'desc';
        search?: string;
    }) => Promise<void>;
    onOpen: () => void;
    onClose: () => void;
}

export const useInventoryStore = create(
    persist<IInventoryStore>(
        (set) => ({
            // Initial state
            isOpen: false,
            inventories: [],
            loading: false,
            isAssignOpen: false,
            error: null,

            // Actions
            getAll: async (options) => {
                set({ loading: true, error: null });
                try {
                    const response = await getAll();

                    if (response.success && response.data) {
                        set({
                            inventories: response.data,
                            loading: false,
                            error: null
                        });
                    } else {
                        set({
                            inventories: [],
                            loading: false,
                            error:  'Failed to fetch categories'
                        });
                    }
                } catch (error) {
                    console.error("Error fetching categories:", error);
                    set({
                        inventories: [],
                        loading: false,
                        error: 'An unexpected error occurred while fetching categories'
                    });
                }
            },
            onOpen: () => set({ isOpen: true }),
            onClose: () => set({ isOpen: false }),
        }),
        {
            name: 'category_store',
        }
    )
);