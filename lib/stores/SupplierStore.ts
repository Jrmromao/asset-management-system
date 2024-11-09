import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAllSimple } from "@/lib/actions/supplier.actions";


interface SupplierStore {
    // State
    suppliers: Supplier[];
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    onOpen: () => void;
    onClose: () => void;
    getAll: () => Promise<void>;
    clearError: () => void;
}

export const useSupplierStore = create(
    persist<SupplierStore>(
        (set) => ({
            // Initial State
            suppliers: [],
            isOpen: false,
            isLoading: false,
            error: null,

            // UI Actions
            onOpen: () => set({ isOpen: true }),
            onClose: () => set({ isOpen: false, error: null }),
            clearError: () => set({ error: null }),

            // Data Actions
            getAll: async () => {
                set({ isLoading: true, error: null });
                try {
                    const result = await getAllSimple();

                    if (result.error) {
                        set({ error: result.error });
                        return;
                    }

                    set({ suppliers: result.data || [] });
                } catch (error) {
                    console.error('Failed to fetch suppliers:', error);
                    set({ error: 'Failed to fetch suppliers' });
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: 'supplier-store',
            version: 1,
            skipHydration: true,
        }
    )
);