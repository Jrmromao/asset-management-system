// hooks/useGenericQuery.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface GenericItem extends Partial<BaseEntity> {
  name: string;
}

// Or more specifically
interface GenericItem {
  id?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;

  [key: string]: any;
}

interface CrudActions<T> {
  getAll: () => Promise<ActionResponse<T[]>>;
  insert: (item: T) => Promise<ActionResponse<T>>;
  update?: (item: T) => Promise<ActionResponse<T>>;
  delete?: (id: string) => Promise<ActionResponse<void>>;
}

interface UseGenericQueryOptions {
  onClose?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function createGenericQuery<T extends GenericItem>(
  queryKey: readonly string[],
  actions: CrudActions<T>,
  options?: UseGenericQueryOptions,
) {
  return function useGenericQuery() {
    const queryClient = useQueryClient();
    const { onClose } = options || {};

    // Query hook
    const {
      data: items = [],
      isLoading,
      error,
    } = useQuery({
      queryKey,
      queryFn: async () => {
        const result = await actions.getAll();
        return result.data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // Create mutation
    const { mutate: createItem, isPending: isCreating } = useMutation({
      mutationFn: async (data: Omit<T, "id">) => {
        const newItem: T = {
          id: crypto.randomUUID(),
          ...data,
        } as T;
        const result = await actions.insert(newItem);
        if ("error" in result) throw new Error(result.error);
        return result.data;
      },
      onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey });
        const previousItems = queryClient.getQueryData(queryKey);

        const optimisticItem: T = {
          id: crypto.randomUUID(),
          ...newData,
        } as T;

        queryClient.setQueryData(queryKey, (old: T[] = []) => {
          return [...old, optimisticItem].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        });

        return { previousItems };
      },
      onError: (err, newItem, context) => {
        if (context?.previousItems) {
          queryClient.setQueryData(queryKey, context.previousItems);
        }
        console.error(`Create ${queryKey[0]} error:`, err?.message || err);
        toast.error(options?.errorMessage || `Failed to create ${queryKey[0]}`);
      },
      onSuccess: () => {
        toast.success(
          options?.successMessage || `${queryKey[0]} created successfully`,
        );
        onClose?.();
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });

    return {
      items,
      isLoading,
      error,
      createItem,
      isCreating,
    };
  };
}
