import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getMaintenanceFlows,
  createMaintenanceFlow,
  updateMaintenanceFlow,
  deleteMaintenanceFlow,
  getMaintenanceFlowStats,
  type MaintenanceFlow,
  type CreateMaintenanceFlowParams,
  type UpdateMaintenanceFlowParams,
} from "@/lib/actions/maintenanceFlow.actions";

export const MAINTENANCE_FLOW_QUERY_KEYS = {
  all: ["maintenance-flows"] as const,
  lists: () => [...MAINTENANCE_FLOW_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...MAINTENANCE_FLOW_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...MAINTENANCE_FLOW_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...MAINTENANCE_FLOW_QUERY_KEYS.details(), id] as const,
  stats: () => [...MAINTENANCE_FLOW_QUERY_KEYS.all, "stats"] as const,
};

export interface UseMaintenanceFlowQueryOptions {
  enabled?: boolean;
  filters?: Record<string, any>;
}

export const useMaintenanceFlowQuery = (options: UseMaintenanceFlowQueryOptions = {}) => {
  const queryClient = useQueryClient();
  const { enabled = true, filters = {} } = options;

  // Get all maintenance flows
  const {
    data: flows = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: MAINTENANCE_FLOW_QUERY_KEYS.list(filters),
    queryFn: () => getMaintenanceFlows(filters),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get maintenance flow stats
  const {
    data: stats,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: MAINTENANCE_FLOW_QUERY_KEYS.stats(),
    queryFn: getMaintenanceFlowStats,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Create maintenance flow mutation
  const createMutation = useMutation({
    mutationFn: createMaintenanceFlow,
    onMutate: async (newFlow) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: MAINTENANCE_FLOW_QUERY_KEYS.lists() });

      // Snapshot the previous value
      const previousFlows = queryClient.getQueryData(MAINTENANCE_FLOW_QUERY_KEYS.list(filters));

      // Optimistically update
      const optimisticFlow = {
        id: `temp-${Date.now()}`,
        ...newFlow,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        executionCount: 0,
        successRate: 0,
      };

      queryClient.setQueryData(
        MAINTENANCE_FLOW_QUERY_KEYS.list(filters),
        (old: MaintenanceFlow[] = []) => [...old, optimisticFlow]
      );

      return { previousFlows };
    },
    onError: (err, newFlow, context) => {
      // Rollback on error
      if (context?.previousFlows) {
        queryClient.setQueryData(MAINTENANCE_FLOW_QUERY_KEYS.list(filters), context.previousFlows);
      }
      toast.error("Failed to create maintenance flow");
    },
    onSuccess: (data) => {
      toast.success("Maintenance flow created successfully");
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_FLOW_QUERY_KEYS.all });
    },
  });

  // Update maintenance flow mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: UpdateMaintenanceFlowParams & { id: string }) =>
      updateMaintenanceFlow(id, data),
    onMutate: async ({ id, ...updatedData }) => {
      await queryClient.cancelQueries({ queryKey: MAINTENANCE_FLOW_QUERY_KEYS.lists() });

      const previousFlows = queryClient.getQueryData(MAINTENANCE_FLOW_QUERY_KEYS.list(filters));

      // Optimistically update
      queryClient.setQueryData(
        MAINTENANCE_FLOW_QUERY_KEYS.list(filters),
        (old: MaintenanceFlow[] = []) =>
          old.map((flow) =>
            flow.id === id
              ? { ...flow, ...updatedData, updatedAt: new Date() }
              : flow
          )
      );

      return { previousFlows };
    },
    onError: (err, variables, context) => {
      if (context?.previousFlows) {
        queryClient.setQueryData(MAINTENANCE_FLOW_QUERY_KEYS.list(filters), context.previousFlows);
      }
      toast.error("Failed to update maintenance flow");
    },
    onSuccess: () => {
      toast.success("Maintenance flow updated successfully");
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_FLOW_QUERY_KEYS.all });
    },
  });

  // Delete maintenance flow mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMaintenanceFlow,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: MAINTENANCE_FLOW_QUERY_KEYS.lists() });

      const previousFlows = queryClient.getQueryData(MAINTENANCE_FLOW_QUERY_KEYS.list(filters));

      // Optimistically remove
      queryClient.setQueryData(
        MAINTENANCE_FLOW_QUERY_KEYS.list(filters),
        (old: MaintenanceFlow[] = []) => old.filter((flow) => flow.id !== id)
      );

      return { previousFlows };
    },
    onError: (err, id, context) => {
      if (context?.previousFlows) {
        queryClient.setQueryData(MAINTENANCE_FLOW_QUERY_KEYS.list(filters), context.previousFlows);
      }
      toast.error("Failed to delete maintenance flow");
    },
    onSuccess: () => {
      toast.success("Maintenance flow deleted successfully");
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_FLOW_QUERY_KEYS.all });
    },
  });

  return {
    // Data
    items: flows,
    stats,
    
    // Loading states
    isLoading,
    isStatsLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Error states
    error,
    
    // Actions
    createItem: createMutation.mutate,
    updateItem: updateMutation.mutate,
    deleteItem: deleteMutation.mutate,
    refetch,
    
    // Async actions
    createItemAsync: createMutation.mutateAsync,
    updateItemAsync: updateMutation.mutateAsync,
    deleteItemAsync: deleteMutation.mutateAsync,
  };
};

export default useMaintenanceFlowQuery; 