import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseFormDataProps<T> {
  fetchFn: () => Promise<{ data?: T[]; error?: string }>;
  dependencyKey?: string;
  onError?: (error: string) => void;
}

export function useFormData<T>({
  fetchFn,
  dependencyKey = "",
  onError,
}: UseFormDataProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await fetchFn();

        if (result.error) {
          throw new Error(result.error);
        }

        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch data";
        onError?.(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dependencyKey, fetchFn]);

  return { data, isLoading };
}
