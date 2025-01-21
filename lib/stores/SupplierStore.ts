import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SupplierStore {
  // State
  suppliers: Supplier[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  onOpen: () => void;
  onClose: () => void;
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
    }),
    {
      name: "supplier-store",
      version: 1,
      skipHydration: true,
    },
  ),
);
