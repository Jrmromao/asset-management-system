import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { findAll } from "@/lib/actions/category.actions";

// Types
export interface Category {
  id: string;
  name: string;
  createdAt: Date;
  // Add other category properties as needed
}

export interface CategoryFilterOptions {
  orderBy?: "name" | "createdAt";
  order?: "asc" | "desc";
  search?: string;
}

interface CategoryState {
  isOpen: boolean;
  categories: Category[];
  loading: boolean;
  isAssignOpen: boolean;
  error: string | null;
}

interface CategoryActions {
  getAll: (options?: CategoryFilterOptions) => Promise<void>;
  onOpen: () => void;
  onClose: () => void;
  onAssignOpen: () => void;
  onAssignClose: () => void;
  reset: () => void;
}

type CategoryStore = CategoryState & CategoryActions;

// Persist configuration
type CategoryPersist = Pick<CategoryState, "categories">;

const persistOptions: PersistOptions<CategoryStore, CategoryPersist> = {
  name: "category_store",
  partialize: (state) => ({
    categories: state.categories,
  }),
};

// Initial state
const initialState: CategoryState = {
  isOpen: false,
  categories: [],
  loading: false,
  isAssignOpen: false,
  error: null,
};

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      getAll: async (options?: CategoryFilterOptions) => {
        set({ loading: true, error: null });
        try {
          const response: ActionResponse<Category[]> = await findAll(options);

          if (response.success && response.data) {
            set({
              categories: response.data,
              loading: false,
              error: null,
            });
          } else {
            set({
              categories: [],
              loading: false,
              error: response.error || "Failed to fetch categories",
            });
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
          set({
            categories: [],
            loading: false,
            error: "An unexpected error occurred while fetching categories",
          });
        }
      },

      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
      onAssignOpen: () => set({ isAssignOpen: true }),
      onAssignClose: () => set({ isAssignOpen: false }),

      reset: () => {
        const { categories } = get();
        set({
          ...initialState,
          categories, // Preserve categories when resetting other state
        });
      },
    }),
    persistOptions,
  ),
);

// Selector hooks for better performance
// export const useCategoryLoading = () => useCategoryStore((state) => state.loading);
// export const useCategories = () => useCategoryStore((state) => state.categories);
// export const useCategoryError = () => useCategoryStore((state) => state.error);
// export const useCategoryModals = () =>
//     useCategoryStore((state) => ({
//         isOpen: state.isOpen,
//         isAssignOpen: state.isAssignOpen,
//     }));
