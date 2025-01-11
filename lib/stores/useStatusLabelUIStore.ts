// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import produce from "immer";
// import { getAll, insert } from "@/lib/actions/statusLabel.actions";
//
// interface IStatusLabelStore {
//   statusLabels: StatusLabel[];
//   loading: boolean;
//   create: (data: StatusLabel) => Promise<void>;
//   findById: (id: string) => StatusLabel | null;
//   delete: (id: string) => void;
//   getAll: () => Promise<void>;
//   isOpen: boolean;
//   onOpen: () => void;
//   onClose: () => void;
//   error: string | null;
//   lastFetched: Date | null;
//   needsRefresh: () => boolean;
// }
//
// export const useStatusLabelStore = create(
//   persist<IStatusLabelStore>(
//     (set, get) => ({
//       statusLabels: [],
//       lastFetched: null,
//       error: null,
//
//       loading: false,
//       needsRefresh: () => {
//         const lastFetched = get().lastFetched;
//         if (!lastFetched) return true;
//         // Refresh if last fetch was more than 5 minutes ago
//         return Date.now() - lastFetched.getTime() > 5 * 60 * 1000;
//       },
//       getAll: async () => {
//         // If data is recent, don't fetch again
//         if (!get().needsRefresh() && get().statusLabels.length > 0) {
//           return;
//         }
//
//         set({ loading: true, error: null });
//         try {
//           const result = await getAll();
//           set({
//             statusLabels: result || [],
//             loading: false,
//             lastFetched: new Date(),
//           });
//         } catch (error) {
//           console.error("Error fetching status labels:", error);
//           set({
//             statusLabels: [],
//             loading: false,
//             error: "Failed to fetch status labels",
//           });
//         }
//       },
//
//       create: async (data: StatusLabel) => {
//         try {
//           await insert(data);
//           // Optimistically update the store
//           set(
//             produce((state) => {
//               state.statusLabels.unshift(data); // Add to beginning of array
//               state.statusLabels.sort((a: StatusLabel, b: StatusLabel) =>
//                 a.name.localeCompare(b.name),
//               ); // Sort alphabetically
//             }),
//           );
//           // Refresh the list to ensure consistency
//           get().getAll();
//         } catch (error) {
//           console.error("Error creating status label:", error);
//           throw error;
//         }
//       },
//
//       delete: (id: string) => {
//         set(
//           produce((state) => {
//             // remove(id)
//             //   .then(() => {
//             //     state.statusLabels = state.statusLabels.filter(
//             //       (a: StatusLabel) => a.id !== id,
//             //     );
//             //   })
//             //   .catch((error) => console.error(error));
//           }),
//         );
//       },
//
//       findById: (id: string) => {
//         const statusLabel = get().statusLabels.find(
//           (statusLabel) => statusLabel.id === id,
//         );
//         return statusLabel || null;
//       },
//
//       isOpen: false,
//       onOpen: () => set({ isOpen: true }),
//       onClose: () => set({ isOpen: false }),
//     }),
//     { name: "status_label_store" },
//   ),
// );

// lib/stores/useStatusLabelUIStore.ts
import { create } from "zustand";

interface IStatusLabelUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useStatusLabelUIStore = create<IStatusLabelUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
