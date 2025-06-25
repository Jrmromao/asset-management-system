import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getAllMaintenance, 
  updateMaintenanceStatus, 
  deleteMaintenance,
  createMaintenanceEvent,
  getMaintenanceStats 
} from '@/lib/actions/maintenance.actions';
import { MaintenanceRow } from '@/components/tables/MaintenanceColumns';

// Query Keys - Centralized for consistency
export const MAINTENANCE_QUERY_KEYS = {
  all: ['maintenance'] as const,
  lists: () => [...MAINTENANCE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...MAINTENANCE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...MAINTENANCE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MAINTENANCE_QUERY_KEYS.details(), id] as const,
  stats: () => [...MAINTENANCE_QUERY_KEYS.all, 'stats'] as const,
} as const;

// Types for better type safety
interface MaintenanceFilters {
  status?: string[];
  assetId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}

interface MaintenanceStats {
  scheduled: number;
  inProgress: number;
  completed: number;
  overdue: number;
  totalCost: number;
  avgCost: number;
  co2Impact: number;
}

interface UseMaintenanceOptions {
  filters?: MaintenanceFilters;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function useMaintenance(options: UseMaintenanceOptions = {}) {
  const { filters = {}, enabled = true, staleTime = 30000, gcTime = 300000 } = options;
  const queryClient = useQueryClient();

  // Main maintenance data query
  const {
    data: maintenanceData = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useQuery<MaintenanceRow[]>({
    queryKey: MAINTENANCE_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<MaintenanceRow[]> => {
      const response = await getAllMaintenance();
      if (response.success && response.data) {
        return response.data.map((item: any) => ({
          ...item,
          asset: {
            ...item.asset,
            category: item.asset.category ? { name: item.asset.category.name } : undefined,
          },
        })) as MaintenanceRow[];
      }
      throw new Error(response.error || "Failed to load maintenance records");
    },
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Stats query - separate for better caching
  const {
    data: stats,
    isLoading: isStatsLoading
  } = useQuery<MaintenanceStats>({
    queryKey: MAINTENANCE_QUERY_KEYS.stats(),
    queryFn: async (): Promise<MaintenanceStats> => {
      const response = await getMaintenanceStats();
      if (response.success && response.data) {
        return response.data as MaintenanceStats;
      }
      return {
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
        totalCost: 0,
        avgCost: 0,
        co2Impact: 0,
      } as MaintenanceStats;
    },
    staleTime: 60000, // Stats can be slightly staler
    gcTime: 600000,
  });

  // Computed stats from data (fallback if stats endpoint fails)
  const computedStats = useMemo((): MaintenanceStats => {
    const scheduled = maintenanceData.filter((m: MaintenanceRow) => m.statusLabel.name === "Scheduled").length;
    const inProgress = maintenanceData.filter((m: MaintenanceRow) => m.statusLabel.name === "In Progress").length;
    const completed = maintenanceData.filter((m: MaintenanceRow) => m.statusLabel.name === "Completed").length;
    const overdue = maintenanceData.filter((m: MaintenanceRow) => {
      const startDate = new Date(m.startDate);
      const now = new Date();
      return startDate < now && !m.completionDate && m.statusLabel.name !== "Completed";
    }).length;

    const totalCost = maintenanceData.reduce((sum: number, m: MaintenanceRow) => {
      const cost = m.totalCost || m.cost || 0;
      return sum + (m.isWarranty ? 0 : Number(cost));
    }, 0);

    const avgCost = maintenanceData.length > 0 ? totalCost / maintenanceData.length : 0;

    const co2Impact = maintenanceData.reduce((sum: number, m: MaintenanceRow) => {
      const co2Total = m.co2eRecords?.reduce((recordSum: number, record: any) => recordSum + Number(record.co2e), 0) || 0;
      return sum + co2Total;
    }, 0);

    return {
      scheduled,
      inProgress,
      completed,
      overdue,
      totalCost,
      avgCost,
      co2Impact,
    };
  }, [maintenanceData]);

  // Use stats from API if available, otherwise use computed
  const finalStats = stats || computedStats;

  // Filtered data based on filters
  const filteredData = useMemo((): MaintenanceRow[] => {
    let filtered = [...maintenanceData];

    // Status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(item => 
        filters.status!.includes(item.statusLabel.name)
      );
    }

    // Asset filter
    if (filters.assetId) {
      filtered = filtered.filter(item => item.asset.id === filters.assetId);
    }

    // Date range filter
    if (filters.dateRange) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.startDate);
        return itemDate >= filters.dateRange!.from && itemDate <= filters.dateRange!.to;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.asset.name.toLowerCase().includes(searchLower) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
        (item.supplier && item.supplier.name.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [maintenanceData, filters]);

  // Update status mutation with optimistic updates
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await updateMaintenanceStatus(id, status);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update status');
      }
      return response.data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: MAINTENANCE_QUERY_KEYS.lists() });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(MAINTENANCE_QUERY_KEYS.list(filters));

      // Optimistically update
      queryClient.setQueryData(MAINTENANCE_QUERY_KEYS.list(filters), (old: MaintenanceRow[] | undefined) => {
        if (!old) return old;
        return old.map(item =>
          item.id === id
            ? { ...item, statusLabel: { ...item.statusLabel, name: status } }
            : item
        );
      });

      // Return context for rollback
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(MAINTENANCE_QUERY_KEYS.list(filters), context.previousData);
      }
      toast.error(err.message || 'Failed to update status');
    },
    onSuccess: (data, { status }) => {
      toast.success(`Status updated to ${status}`);
      // Invalidate stats to refresh counts
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.stats() });
    },
  });

  // Delete mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      const response: any = await deleteMaintenance(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete maintenance');
      }
      return response.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: MAINTENANCE_QUERY_KEYS.lists() });

      const previousData = queryClient.getQueryData(MAINTENANCE_QUERY_KEYS.list(filters));

      // Optimistically remove
      queryClient.setQueryData(MAINTENANCE_QUERY_KEYS.list(filters), (old: MaintenanceRow[] | undefined) => {
        if (!old) return old;
        return old.filter(item => item.id !== id);
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(MAINTENANCE_QUERY_KEYS.list(filters), context.previousData);
      }
      toast.error(err.message || 'Failed to delete maintenance');
    },
    onSuccess: () => {
      toast.success('Maintenance record deleted');
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.stats() });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (maintenanceData: any) => {
      const response = await createMaintenanceEvent(maintenanceData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create maintenance');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Maintenance scheduled successfully');
      // Invalidate both list and stats
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.stats() });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to schedule maintenance');
    },
  });

  // Utility functions
  const updateStatus = useCallback((id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const deleteMaintenanceRecord = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const createMaintenance = useCallback((data: any) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: MAINTENANCE_QUERY_KEYS.all });
  }, [queryClient]);

  const prefetchMaintenance = useCallback((newFilters: MaintenanceFilters) => {
    queryClient.prefetchQuery({
      queryKey: MAINTENANCE_QUERY_KEYS.list(newFilters),
      queryFn: async () => {
        const response = await getAllMaintenance();
        if (response.success && response.data) {
          return response.data.map((item: any) => ({
            ...item,
            asset: {
              ...item.asset,
              category: item.asset.category ? { name: item.asset.category.name } : undefined,
            },
          }));
        }
        throw new Error(response.error || "Failed to load maintenance records");
      },
      staleTime,
    });
  }, [queryClient, staleTime]);

  return {
    // Data
    data: filteredData,
    allData: maintenanceData,
    stats: finalStats,
    
    // Loading states
    isLoading,
    isStatsLoading,
    isFetching,
    
    // Error states
    error,
    
    // Mutations
    updateStatus,
    deleteMaintenance: deleteMaintenanceRecord,
    createMaintenance,
    
    // Mutation states
    isUpdating: updateStatusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCreating: createMutation.isPending,
    
    // Utilities
    refetch,
    invalidateAll,
    prefetchMaintenance,
    
    // Computed values
    isEmpty: filteredData.length === 0,
    hasFilters: Object.keys(filters).some(key => {
      const value = filters[key as keyof MaintenanceFilters];
      return Array.isArray(value) ? value.length > 0 : !!value;
    }),
  };
} 