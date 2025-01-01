import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Actions = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export type LicenseAction = {
  shouldRefresh: boolean;
  updateRefresh: (flag: boolean) => void;
  licenses: License[];
  setLicenses: (licenses: License[]) => void;
};

export const useDialogStore = create<Actions>()(
  persist(
    (set) => ({
      isOpen: false,
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
    }),
    { name: "dialog_store" },
  ),
);

export const licenseStore = create<LicenseAction>()(
  persist(
    (set) => ({
      shouldRefresh: false,
      updateRefresh: (flag: boolean) => set({ shouldRefresh: flag }),
      licenses: [],
      setLicenses: (licenses: License[]) => set({ licenses: licenses }),
    }),
    { name: "license_store" },
  ),
);
