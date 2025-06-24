"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useDialogStore } from "@/lib/stores/store";
import { useRouter } from "next/navigation";
import { maintenanceFlowColumns } from "@/components/tables/MaintenanceFlowColumns";
import StatusCards from "@/components/StatusCards";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import HeaderBox from "@/components/HeaderBox";
import { Workflow, Settings, BarChart3, Activity, Clock } from "lucide-react";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { DataTableHeader } from "@/components/tables/TableHeader";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable/data-table";
// import { useMaintenanceFlowQuery } from "@/hooks/queries/useMaintenanceFlowQuery";
import { toast } from "sonner";
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceFlowBuilder } from "@/components/maintenance/MaintenanceFlowBuilder";
import { MaintenanceTypeManager } from "@/components/maintenance/MaintenanceTypeManager";
import { MaintenanceFlow } from "@/lib/actions/maintenanceFlow.actions";
import { EmptyStateCard } from "@/components/EmptyStateCard";

// Constants for better maintainability
const SEARCH_DEBOUNCE_MS = 300;

// Utility function for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized search function
const searchFlows = (flows: MaintenanceFlow[], searchTerm: string): MaintenanceFlow[] => {
  if (!searchTerm.trim()) return flows;

  const searchLower = searchTerm.toLowerCase();
  const searchableFields = [
    "name",
    "description", 
    "trigger",
  ];

  return flows.filter((flow) => {
    return searchableFields.some((field) => {
      const value = getNestedValue(flow, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

const MaintenanceFlowsPage = () => {
  // Mock data for now until the hook is properly implemented
  const isLoading = false;
  const flows: MaintenanceFlow[] = [];
  const stats = {
    totalFlows: 0,
    activeFlows: 0,
    averageSuccessRate: 0,
    recentExecutions: 0,
  };
  const isStatsLoading = false;

  // Demo mode - uncomment to see cards with sample data
  // const stats = {
  //   totalFlows: 5,
  //   activeFlows: 3,
  //   averageSuccessRate: 92,
  //   recentExecutions: 12,
  // };
  const deleteItem = (id: string) => console.log('Delete', id);
  const updateItem = (data: any) => console.log('Update', data);

  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("flows");
  const [filters, setFilters] = useState({
    priority: "",
    status: "",
  });

  // Event handlers
  const handleView = useCallback(
    (flow: MaintenanceFlow) => {
      startTransition(() => {
        navigate.push(`/maintenance-flows/view/${flow.id}`);
      });
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (flow: MaintenanceFlow) => {
      startTransition(() => {
        navigate.push(`/maintenance-flows/edit/${flow.id}`);
      });
    },
    [navigate],
  );

  const onDelete = useCallback(
    (flow: MaintenanceFlow) => {
      if (flow?.id) {
        deleteItem(flow.id);
      }
    },
    [deleteItem],
  );

  const onToggleActive = useCallback(
    (flow: MaintenanceFlow) => {
      if (flow?.id) {
        updateItem({
          id: flow.id,
          isActive: !flow.isActive,
        } as any);
      }
    },
    [updateItem],
  );

  const handleCreateNew = useCallback(() => {
    setActiveTab("builder");
  }, []);

  // Table configuration
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => {
    return maintenanceFlowColumns({ 
      onDelete, 
      onView: handleView, 
      onEdit: handleEdit,
      onToggleActive 
    }) as ColumnDef<MaintenanceFlow>[];
  }, [onDelete, handleView, handleEdit, onToggleActive]);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Memoized computed values
  const filteredData = useMemo(() => {
    let filtered = searchFlows(flows, debouncedSearchTerm);
    
    // Apply filters
    if (filters.priority) {
      filtered = filtered.filter(flow => flow.priority === parseInt(filters.priority));
    }
    if (filters.status) {
      const isActive = filters.status === "active";
      filtered = filtered.filter(flow => flow.isActive === isActive);
    }
    
    return filtered;
  }, [flows, debouncedSearchTerm, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Optimized export function with better error handling
  const handleExport = useCallback(async () => {
    try {
      const response = await fetch("/api/maintenance-flows/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maintenance-flows-${new Date().toISOString().split("T")[0]}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Maintenance flows exported successfully");
    } catch (error) {
      console.error("Error exporting maintenance flows:", error);
      toast.error("Failed to export maintenance flows");
    }
  }, []);

  // Memoized card data with better empty states and visual indicators
  const cardData = useMemo(
    () => [
      {
        title: "Total Flows",
        value: stats?.totalFlows ? stats.totalFlows.toString() : "—",
        subtitle: stats?.totalFlows === 0 ? "Create your first automation flow" : 
                 stats?.totalFlows === 1 ? "1 flow configured" : `${stats.totalFlows} flows configured`,
        color: "info" as const,
        icon: <Workflow className="w-4 h-4" />,
      },
      {
        title: "Active Flows",
        value: stats?.activeFlows ? stats.activeFlows.toString() : "—",
        subtitle: stats?.totalFlows === 0 ? "No flows created yet" :
                 stats?.activeFlows === 0 ? "All flows are inactive" :
                 stats?.activeFlows === stats?.totalFlows ? "All flows are active" :
                 `${(stats?.totalFlows || 0) - (stats?.activeFlows || 0)} inactive`,
        color: stats?.activeFlows && stats.activeFlows > 0 ? "success" as const : "default" as const,
        icon: <Activity className="w-4 h-4" />,
      },
      {
        title: "Success Rate",
        value: stats?.averageSuccessRate ? `${stats.averageSuccessRate}%` : "—",
        subtitle: stats?.totalFlows === 0 ? "No flows to measure" :
                 stats?.averageSuccessRate === undefined ? "No executions yet" :
                 stats.averageSuccessRate >= 95 ? "Excellent performance" :
                 stats.averageSuccessRate >= 80 ? "Good performance" :
                 stats.averageSuccessRate >= 60 ? "Needs attention" : "Requires optimization",
        color: !stats?.averageSuccessRate ? "default" as const :
               stats.averageSuccessRate >= 90 ? "success" as const : 
               stats.averageSuccessRate >= 70 ? "warning" as const : "danger" as const,
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        title: "Recent Executions",
        value: stats?.recentExecutions ? stats.recentExecutions.toString() : "—",
        subtitle: stats?.recentExecutions === 0 ? "No recent activity" :
                 stats?.recentExecutions === 1 ? "1 execution this week" :
                 `${stats.recentExecutions} executions this week`,
        color: stats?.recentExecutions && stats.recentExecutions > 0 ? "info" as const : "default" as const,
        icon: <Clock className="w-4 h-4" />,
      },
    ],
    [stats],
  );

  // Enhanced loading state that matches the actual page structure
  if (isLoading || isStatsLoading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/maintenance-flows">Maintenance Flows</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="Custom Maintenance Flows"
          subtitle="Create, manage, and monitor automated maintenance workflows"
          icon={<Workflow className="w-4 h-4" />}
        />

        {/* Status Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-10 rounded-md ${
                  i === 0 ? 'bg-white dark:bg-gray-700' : 'bg-transparent'
                } animate-pulse`}
              >
                <div className="flex items-center justify-center h-full space-x-2">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Header Skeleton */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex space-x-2">
                <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Table Skeleton */}
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Table Header */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-4">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
                          i === 0 ? 'w-32' : i === 1 ? 'w-24' : i === 2 ? 'w-20' : 'w-16'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Table Rows */}
                {[...Array(5)].map((_, rowIndex) => (
                  <div key={rowIndex} className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {[...Array(9)].map((_, colIndex) => (
                        <div
                          key={colIndex}
                          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${
                            colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-24' : colIndex === 2 ? 'w-20' : 'w-16'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex space-x-2">
                    <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/maintenance-flows">Maintenance Flows</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Custom Maintenance Flows"
        subtitle="Create, manage, and monitor automated maintenance workflows"
        icon={<Workflow className="w-4 h-4" />}
      />

      <StatusCards cards={cardData} columns={4} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="flows" className="flex items-center space-x-2">
            <Workflow className="w-4 h-4" />
            <span>Active Flows</span>
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Flow Builder</span>
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Maintenance Types</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flows" className="space-y-4">
          <DataTableHeader
            table={table}
            addNewText="Create Flow"
            onAddNew={handleCreateNew}
            onExport={handleExport}
            isLoading={isLoading || isPending}
            filterPlaceholder="Search flows..."
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
            showFilter={false}
          />

          {filteredData.length === 0 && !isLoading ? (
            <EmptyStateCard
              icon={Workflow}
              title="No Maintenance Flows Yet"
              description="Create your first automated maintenance workflow to streamline your asset management processes. Flows can automatically schedule maintenance, send notifications, and track progress."
              actionText="Create Your First Flow"
              onAction={handleCreateNew}
            />
          ) : (
            <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <DataTable
                  columns={columns}
                  data={filteredData}
                  isLoading={isLoading || isPending}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="builder">
          <MaintenanceFlowBuilder />
        </TabsContent>

        <TabsContent value="types">
          <MaintenanceTypeManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceFlowsPage; 