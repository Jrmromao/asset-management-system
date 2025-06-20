import { create } from "zustand";

interface PurchaseOrderUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const usePurchaseOrderUIStore = create<PurchaseOrderUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
