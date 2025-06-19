import { create } from "zustand";

interface AssetUIState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useAssetUIStore = create<AssetUIState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
