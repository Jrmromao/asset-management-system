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
  updateSuccessMessage?: string;
  updateErrorMessage?: string;
}

export interface CrudActions<T, TCreateInput, TUpdateInput = TCreateInput> {
  getAll: () => Promise<ActionResponse<T[]>>;
  insert: (data: TCreateInput) => Promise<ActionResponse<T>>;
  update: (id: string, data: TUpdateInput) => Promise<ActionResponse<T>>;
  delete?: (id: string) => Promise<ActionResponse<T>>;
  findById?: (id: string) => Promise<ActionResponse<T>>;
}

interface UpdatePayload<T, TUpdateInput = T> {
  id: string;
  data: TUpdateInput;
}

interface UseGenericQueryResult<T, TCreateInput, TUpdateInput = TCreateInput> {
  items: T[];
  isLoading: boolean;
  error: Error | null;
  createItem: (
    data: TCreateInput,
    callbacks?: {
      onSuccess?: ((result: ActionResponse<T>) => void) | (() => void);
      onError?: (error: Error) => void;
    },
  ) => Promise<ActionResponse<T>>;
  deleteItem: (
    id: string,
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) => Promise<ActionResponse<T>>;
  updateItem: (
    id: string,
    data: TUpdateInput,
    callbacks?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    },
  ) => Promise<ActionResponse<T>>;
  isCreating: boolean;
  isDeleting: boolean;
  isUpdating: boolean;
  refresh: () => Promise<void>;
  findById?: (id: string) => Promise<T | undefined>;
}

export function createGenericQuery<T extends { id?: string }, TCreateInput, TUpdateInput = TCreateInput>(
  queryKey: QueryKey,
  actions: CrudActions<T, TCreateInput, TUpdateInput>,
  options: UseGenericQueryOptions<T> = {},
): () => UseGenericQueryResult<T, TCreateInput, TUpdateInput> {
  return function useGenericQuery(): UseGenericQueryResult<T, TCreateInput, TUpdateInput> {
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

    const { mutate: mutateCreate, isPending: isCreating } = useMutation<
      ActionResponse<T>,
      Error,
      TCreateInput,
      MutationContext
    >({
      mutationFn: async (data: TCreateInput) => {
        const result = await actions.insert(data);
        if (result.error) throw new Error(result.error);
        return result;
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
      ActionResponse<T>,
      Error,
      string,
      MutationContext
    >({
      mutationFn: async (id: string) => {
        if (!actions.delete) {
          throw new Error("Delete action not implemented");
        }
        const result = await actions.delete(id);
        if (result.error) throw new Error(result.error);
        return result;
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
        toast.error(options?.errorMessage || `Failed to delete ${queryKey[0]}`);
      },
      onSuccess: () => {
        toast.success(
          options?.successMessage || `${queryKey[0]} deleted successfully`,
        );
        onClose?.();
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });

    const { mutate: mutateUpdate, isPending: isUpdating } = useMutation<
      ActionResponse<T>,
      Error,
      UpdatePayload<T, TUpdateInput>,
      MutationContext
    >({
      mutationFn: async ({ id, data }: UpdatePayload<T, TUpdateInput>) => {
        const result = await actions.update(id, data);
        if (result.error) throw new Error(result.error);
        return result;
      },
      onMutate: async ({ id, data }: UpdatePayload<T, TUpdateInput>) => {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData<T[]>(queryKey);
        if (previousData) {
          queryClient.setQueryData<T[]>(
            queryKey,
            previousData.map((item) =>
              item.id === id ? { ...item, ...data } as T : item,
            ),
          );
        }
        return { previousData };
      },
      onError: (err, _, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(queryKey, context.previousData);
        }
        console.error(`Update error:`, err);
        toast.error(options?.updateErrorMessage || `Failed to update ${queryKey[0]}`);
      },
      onSuccess: () => {
        toast.success(
          options?.updateSuccessMessage || `${queryKey[0]} updated successfully`,
        );
        onClose?.();
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey });
      },
    });

    const createItem = useCallback(
      async (
        data: TCreateInput,
        callbacks?: {
          onSuccess?: ((result: ActionResponse<T>) => void) | (() => void);
          onError?: (error: Error) => void;
        },
      ): Promise<ActionResponse<T>> => {
        return new Promise<ActionResponse<T>>((resolve, reject) => {
          mutateCreate(data, {
            onSuccess: (response: ActionResponse<T>) => {
              if (callbacks?.onSuccess) {
                if (callbacks.onSuccess.length > 0) {
                  (callbacks.onSuccess as (result: ActionResponse<T>) => void)(
                    response,
                  );
                } else {
                  (callbacks.onSuccess as () => void)();
                }
              }
              resolve(response);
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
      (
        id: string,
        callbacks?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ): Promise<ActionResponse<T>> => {
        return new Promise<ActionResponse<T>>((resolve, reject) => {
          mutateDelete(id, {
            onSuccess: (result) => {
              callbacks?.onSuccess?.();
              resolve(result);
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

    const updateItem = useCallback(
      (
        id: string,
        data: TUpdateInput,
        callbacks?: {
          onSuccess?: () => void;
          onError?: (error: Error) => void;
        },
      ): Promise<ActionResponse<T>> => {
        return new Promise<ActionResponse<T>>((resolve, reject) => {
          mutateUpdate(
            { id, data },
            {
              onSuccess: (result) => {
                callbacks?.onSuccess?.();
                resolve(result);
              },
              onError: (error) => {
                callbacks?.onError?.(error);
                reject(error);
              },
            },
          );
        });
      },
      [mutateUpdate],
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
      updateItem,
      isCreating,
      isDeleting,
      isUpdating,
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
