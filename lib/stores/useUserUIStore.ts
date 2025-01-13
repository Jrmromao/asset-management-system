// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { findById, getAll } from "@/lib/actions/model.actions";
//
// interface UseModelUIStore {
//   // State
//   models: Model[];
//   selectedModel: Model | null;
//   isOpen: boolean;
//   isLoading: boolean;
//   error: string | null;
//
//   // UI Actions
//   onOpen: () => void;
//   onClose: () => void;
//   clearError: () => void;
//
//   // Data Actions
//   fetchModels: (params?: { search?: string }) => Promise<void>;
//   fetchModel: (id: string) => Promise<void>;
//   setSelectedModel: (model: Model | null) => void;
//
//   // Utility Actions
//   searchModels: (query: string) => void;
//   // sortModels: (key: keyof Model) => void;
//   filterModelsByCategory: (categoryId: string) => void;
//   filterModelsByManufacturer: (manufacturerId: string) => void;
// }
//
// export const useModelStore = create(
//   persist<UseModelUIStore>(
//     (set, get) => ({
//       // Initial State
//       models: [],
//       selectedModel: null,
//       isOpen: false,
//       isLoading: false,
//       error: null,
//
//       // UI Actions
//       onOpen: () => set({ isOpen: true }),
//       onClose: () => set({ isOpen: false }),
//       clearError: () => set({ error: null }),
//
//       // Data Actions
//       fetchModels: async (params) => {
//         set({ isLoading: true, error: null });
//         try {
//           const result = await getAll(params);
//           console.log("MODELS: ", result);
//
//           if (result.error) {
//             set({ error: result.error });
//             return;
//           }
//           set({ models: result.data || [] });
//         } catch (error) {
//           set({
//             error:
//               error instanceof Error ? error.message : "Failed to fetch Models",
//           });
//         } finally {
//           set({ isLoading: false });
//         }
//       },
//
//       fetchModel: async (id: string) => {
//         set({ isLoading: true, error: null });
//         try {
//           const result = await findById(id);
//           if (result.error) {
//             set({ error: result.error });
//             return;
//           }
//           set({ selectedModel: result.data || null });
//         } catch (error) {
//           set({
//             error:
//               error instanceof Error ? error.message : "Failed to fetch model",
//           });
//         } finally {
//           set({ isLoading: false });
//         }
//       },
//
//       setSelectedModel: (model) => set({ selectedModel: model }),
//
//       // Utility Actions
//       searchModels: (query) => {
//         const { models } = get();
//         if (!query) {
//           set({ models: get().models });
//           return;
//         }
//
//         const filtered = models.filter(
//           (model) =>
//             model.name.toLowerCase().includes(query.toLowerCase()) ||
//             model.modelNo.toLowerCase().includes(query.toLowerCase()),
//         );
//         set({ models: filtered });
//       },
//
//       // sortModels: (key) => {
//       //     const { models } = get();
//       //     const sorted = [...models].sort((a, b) => {
//       //         if (a[key] < b[key]) return -1;
//       //         if (a[key] > b[key]) return 1;
//       //         return 0;
//       //     });
//       //     set({ models: sorted });
//       // },
//
//       filterModelsByCategory: (categoryId) => {
//         const { models } = get();
//         if (!categoryId) {
//           set({ models: get().models });
//           return;
//         }
//
//         const filtered = models.filter(
//           (model) => model.categoryId === categoryId,
//         );
//         set({ models: filtered });
//       },
//
//       filterModelsByManufacturer: (manufacturerId) => {
//         const { models } = get();
//         if (!manufacturerId) {
//           set({ models: get().models });
//           return;
//         }
//
//         const filtered = models.filter(
//           (model) => model.manufacturerId === manufacturerId,
//         );
//         set({ models: filtered });
//       },
//     }),
//     {
//       name: "model-store",
//     },
//   ),
// );

import { create } from "zustand";

interface IUserUIStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useUserUIStore = create<IUserUIStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
