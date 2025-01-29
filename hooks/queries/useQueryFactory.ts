import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCallback } from "react";

interface MutationContext {
  previousData: unknown;
}

interface UseGenericQueryOptions<T>
  extends Omit<UseQueryOptions<T[], Error>, "queryKey" | "queryFn"> {
  onClose?: () => void;
  successMessage?: string;
  errorMessage?: string;
  deleteSuccessMessage?: string;
  deleteErrorMessage?: string;
}

interface CrudActions<T, TCreateInput> {
  getAll: () => Promise<ActionResponse<T[]>>;
  insert: (data: TCreateInput) => Promise<ActionResponse<T>>;
  delete: (id: string) => Promise<ActionResponse<T>>;
  findById?: (id: string) => Promise<ActionResponse<T>>;
}

interface UseGenericQueryResult<T, TCreateInput> {
  items: T[];
  isLoading: boolean;
  error: Error | null;
  createItem: (
    data: TCreateInput,
    callbacks?: {
      onSuccess?: ((result: T) => void) | (() => void);
      onError?: (error: Error) => void;
    },
  ) => Promise<T>;
  deleteItem: (
    id: string,
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
  refresh: () => Promise<void>;
  findById?: (id: string) => Promise<T | undefined>;
}

export function createGenericQuery<T extends { id?: string }, TCreateInput>(
  queryKey: QueryKey,
  actions: CrudActions<T, TCreateInput>,
  options: UseGenericQueryOptions<T> = {},
): () => UseGenericQueryResult<T, TCreateInput> {
  return function useGenericQuery(): UseGenericQueryResult<T, TCreateInput> {
    const queryClient = useQueryClient();
    const { onClose } = options;

    const {
      data = [],
      isLoading,
      error,
      refetch,
    } = useQuery<T[], Error>({
      queryKey,
      queryFn: async () => {
        const result = await actions.getAll();
        if (result.error) throw new Error(result.error);
        return result.data || [];
      },
      ...options,
    });

    // Define mutations first
    const { mutate: mutateCreate, isPending: isCreating } = useMutation<
      T,
      Error,
      TCreateInput,
      MutationContext
    >({
      mutationFn: async (data: TCreateInput) => {
        const result = await actions.insert(data);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onMutate: async (newData) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData(queryKey);
        return { previousData };
      },
      onError: (err, _, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        console.error(`Create error:`, err);
        toast.error(options?.errorMessage || `Failed to create ${queryKey[0]}`);
      },
      onSuccess: (data) => {
        toast.success(
          options?.successMessage || `${queryKey[0]} created successfully`,
        );
        onClose?.();
        return data;
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });

    const { mutate: mutateDelete, isPending: isDeleting } = useMutation<
      T,
      Error,
      string,
      MutationContext
    >({
      mutationFn: async (id: string) => {
        const result = await actions.delete(id);
        if (result.error) throw new Error(result.error);
        return result.data!;
      },
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<T[]>(queryKey);
        if (previousData) {
          queryClient.setQueryData<T[]>(
            queryKey,
            previousData.filter((item) => item.id !== id),
          );
        }
        return { previousData };
      },
      onError: (err, _, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        console.error(`Delete error:`, err);
        toast.error(
          options?.deleteErrorMessage || `Failed to delete ${queryKey[0]}`,
        );
      },
      onSuccess: () => {
        toast.success(
          options?.deleteSuccessMessage ||
            `${queryKey[0]} deleted successfully`,
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });

    // Then define the callbacks that use them
    const createItem = useCallback(
      async (
        data: TCreateInput,
        callbacks?: {
          onSuccess?: ((result: T) => void) | (() => void);
          onError?: (error: Error) => void;
        },
      ): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
          mutateCreate(data, {
            onSuccess: (result: T) => {
              if (callbacks?.onSuccess) {
                if (callbacks.onSuccess.length > 0) {
                  (callbacks.onSuccess as (result: T) => void)(result);
                } else {
                  (callbacks.onSuccess as () => void)();
                }
              }
              resolve(result);
            },
            onError: (error) => {
              callbacks?.onError?.(error);
              reject(error);
            },
          });
        });
      },
      [mutateCreate],
    );

    const deleteItem = useCallback(
      async (
        id: string,
        callbacks?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
          mutateDelete(id, {
            onSuccess: () => {
              callbacks?.onSuccess?.();
              resolve();
            },
            onError: (error) => {
              callbacks?.onError?.(error);
              reject(error);
            },
          });
        });
      },
      [mutateDelete],
    );

    const refresh = useCallback(async (): Promise<void> => {
      await refetch();
    }, [refetch]);

    return {
      items: data,
      isLoading,
      error: error as Error | null,
      createItem,
      deleteItem,
      isCreating,
      isDeleting,
      refresh,
      findById: actions.findById
        ? async (id: string) => {
            const result = await actions.findById!(id);
            if (result.error) throw new Error(result.error);
            return result.data!;
          }
        : undefined,
    };
  };
}
