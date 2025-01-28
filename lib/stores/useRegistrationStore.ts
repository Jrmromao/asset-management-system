// lib/stores/useRegistrationStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface RegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  assetCount: number;
  companyId: string; // Add this to store company ID
}

interface RegistrationStore {
  registrationData: RegistrationData | null;
  setRegistrationData: (data: RegistrationData) => void;
  clearRegistrationData: () => void;
}

export const useRegistrationStore = create<RegistrationStore>()(
  persist(
    (set) => ({
      registrationData: null,
      setRegistrationData: (data) => set({ registrationData: data }),
      clearRegistrationData: () => set({ registrationData: null }),
    }),
    {
      name: "registration-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
