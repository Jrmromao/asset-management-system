import { create } from "zustand";

interface UseSupplierUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSupplierUIStore = create<UseSupplierUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
