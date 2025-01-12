import { create } from "zustand";

interface IUserUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useRoleUIStore = create<IUserUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
