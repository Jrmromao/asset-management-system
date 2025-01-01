// formTemplateStore.ts
import { create } from "zustand";
import {
  createFormTemplate,
  getFormTemplateById,
  getFormTemplates,
} from "@/lib/actions/formTemplate.actions";

interface TemplateField {
  name: string;
  type: "text" | "number" | "date" | "select" | "checkbox";
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id: string;
  name: string;
  fields: TemplateField[];
  createdAt: Date;
}

interface FormTemplateStore {
  templates: FormTemplate[];
  selectedTemplate: FormTemplate | null;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onOpen: () => void;
  onClose: () => void;
  fetchTemplates: () => Promise<void>;
  fetchTemplateById: (id: string) => Promise<void>;
  createTemplate: (data: {
    name: string;
    fields: TemplateField[];
  }) => Promise<void>;
  setSelectedTemplate: (template: FormTemplate | null) => void;
}

export const useFormTemplateStore = create<FormTemplateStore>((set, get) => ({
  templates: [],
  selectedTemplate: null,
  isOpen: false,
  isLoading: false,
  error: null,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getFormTemplates();
      if (response.error) {
        set({ error: response.error });
        return;
      }
      set({ templates: response.data || [] });
    } catch (error) {
      set({ error: (error as Error)?.message || "Failed to fetch templates" });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplateById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getFormTemplateById(id);
      if (response.error) {
        set({ error: response.error });
        return;
      }
      // if (response.data) {
      //     set({ selectedTemplate: response.data });
      // }
    } catch (error) {
      set({ error: (error as Error)?.message || "Failed to fetch template" });
    } finally {
      set({ isLoading: false });
    }
  },

  createTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createFormTemplate(data);
      if (response.error) {
        set({ error: response.error });
        return;
      }
      // Refresh templates after creation
      get().fetchTemplates();
      set({ isOpen: false });
    } catch (error) {
      set({ error: (error as Error)?.message || "Failed to create template" });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));
