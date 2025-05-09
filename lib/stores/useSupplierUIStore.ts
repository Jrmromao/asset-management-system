import { create } from "zustand";
import { StoreProps } from "@/lib/stores/store.types";

export const useSupplierUIStore = create<StoreProps>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
