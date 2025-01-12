import { create } from "zustand";

interface ICategoryUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useCategoryUIStore = create<ICategoryUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
