// hooks/useStatusLabelsQuery.ts
import { useTransition } from "react";
import { useStatusLabelUIStore } from "@/lib/stores/useStatusLabelUIStore";

interface StatusLabel {
  id: string;
  name: string;
  description: string;
  colorCode: string;
  isArchived: boolean;
  allowLoan: boolean;
}

interface CreateStatusLabelResult {
  success: boolean;
  data?: StatusLabel;
  error?: unknown;
}

export function useStatusLabels() {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useStatusLabelUIStore();

  return {
    isPending,
    startTransition,
    onClose,
  };
}
