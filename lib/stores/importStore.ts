import { create } from "zustand";

export type ImportProgress =
  | "idle"
  | "parsing"
  | "validating"
  | "importing"
  | "done"
  | "error";

interface ImportStoreState {
  file: File | null;
  setFile: (file: File | null) => void;
  rawData: any[];
  setRawData: (data: any[]) => void;
  columnMapping: Record<string, string>;
  setColumnMapping: (mapping: Record<string, string>) => void;
  errorRows: number[];
  setErrorRows: (rows: number[]) => void;
  warningRows: number[];
  setWarningRows: (rows: number[]) => void;
  progress: ImportProgress;
  setProgress: (progress: ImportProgress) => void;
}

export const useImportStore = create<ImportStoreState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
  rawData: [],
  setRawData: (rawData) => set({ rawData }),
  columnMapping: {},
  setColumnMapping: (columnMapping) => set({ columnMapping }),
  errorRows: [],
  setErrorRows: (errorRows) => set({ errorRows }),
  warningRows: [],
  setWarningRows: (warningRows) => set({ warningRows }),
  progress: "idle",
  setProgress: (progress) => set({ progress }),
}));
