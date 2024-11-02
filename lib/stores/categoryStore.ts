import { create } from "zustand";
import { persist } from "zustand/middleware";
import { findAll } from "@/lib/actions/category.actions";

// Response type from your action
interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface ICategoryStore {
    isOpen: boolean;
    categories: Category[];
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

export const useCategoryStore = create(
    persist<ICategoryStore>(
        (set) => ({
            // Initial state
            isOpen: false,
            categories: [],
            loading: false,
            isAssignOpen: false,
            error: null,

            // Actions
            getAll: async (options) => {
                set({ loading: true, error: null });
                try {
                    const response = await findAll(options);
                    if (response.success && response.data) {
                        set({
                            categories: response.data,
                            loading: false,
                            error: null
                        });
                    } else {
                        set({
                            categories: [],
                            loading: false,
                            error: response.error || 'Failed to fetch categories'
                        });
                    }
                } catch (error) {
                    console.error("Error fetching categories:", error);
                    set({
                        categories: [],
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