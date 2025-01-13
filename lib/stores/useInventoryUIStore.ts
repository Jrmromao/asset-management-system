import { create } from "zustand";

interface IInventoryUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useInventoryUIStore = create<IInventoryUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
