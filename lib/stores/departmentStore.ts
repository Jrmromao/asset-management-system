import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getAll } from "@/lib/actions/department.actions";

interface IDepartmentStore {
  isOpen: boolean;
  departments: Department[];
  loading: boolean;
  isAssignOpen: boolean;
  error: string | null;
  getAll: (options?: {
    orderBy?: "name" | "createdAt";
    order?: "asc" | "desc";
    search?: string;
  }) => Promise<void>;
  onOpen: () => void;
  onClose: () => void;
}

export const useDepartmentStore = create(
  persist<IDepartmentStore>(
    (set) => ({
      isOpen: false,
      departments: [],
      loading: false,
      isAssignOpen: false,
      error: null,

      getAll: async (options) => {
        set({ loading: true, error: null });
        try {
          const response = await getAll(options);
          if (response.success && response.data) {
            set({
              departments: response.data,
              loading: false,
              error: null,
            });
          } else {
            set({
              departments: [],
              loading: false,
              error: response.error || "Failed to fetch departments",
            });
          }
        } catch (error) {
          console.error("Error fetching departments:", error);
          set({
            departments: [],
            loading: false,
            error: "An unexpected error occurred while fetching departments",
          });
        }
      },
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
    }),
    {
      name: "department_store",
    },
  ),
);
