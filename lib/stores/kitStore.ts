// import { create } from "zustand";
// import { persist } from "zustand/middleware";
//
// interface IKitStore {
//   kits: Kit[];
//   loading: boolean;
//   appendItem: (id: string) => Promise<void>;
//   create: (kit: Kit) => void;
//   update: (id: string, updatedKit: Kit) => void;
//   delete: (id: string) => Promise<void>;
//   findById: (id: string) => Kit | null;
//   getAll: () => void;
//   isAssetOpen: boolean;
//   onAssetOpen: () => void;
//   onAssetClose: () => void;
//   isAccessoryOpen: boolean;
//   onAccessoryOpen: () => void;
//   onAccessoryClose: () => void;
//   isLicenseOpen: boolean;
//   onLicenseOpen: () => void;
//   onLicenseClose: () => void;
// }
//
// export const useKitStore = create(
//   persist<IKitStore>(
//     (set) => ({
//       kits: [],
//       loading: false,
//
//       getAll: async () => {
//         set({ loading: true });
//       },
//
//       create: async () => {},
//
//       update: () => {},
//
//       findById: () => {
//         return null;
//       },
//
//       delete: async () => {},
//
//       isLicenseOpen: false,
//       onLicenseOpen: () => set({ isLicenseOpen: true }),
//       onLicenseClose: () => {
//         set({ isLicenseOpen: false });
//       },
//       isAssetOpen: false,
//       onAssetClose: () => set({ isAssetOpen: false }),
//       onAssetOpen: () => {
//         set({ isAssetOpen: true });
//       },
//       isAccessoryOpen: false,
//       onAccessoryOpen: () => set({ isAccessoryOpen: true }),
//       onAccessoryClose: () => {
//         set({ isAccessoryOpen: false });
//       },
//
//       appendItem: async () => {
//         // need to write the code to append a new kit to the kits list
//         set({});
//       },
//     }),
//     { name: "kit_store" },
//   ),
// );
