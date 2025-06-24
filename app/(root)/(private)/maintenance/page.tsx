"use client";

import React, { useState, useMemo, useCallback, useTransition } from "react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { maintenanceColumns } from "@/components/tables/MaintenanceColumns";
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
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import HeaderBox from "@/components/HeaderBox";
import StatusCards from "@/components/StatusCards";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import { DataTableHeader } from "@/components/tables/TableHeader";
import { EmptyStateCard } from "@/components/EmptyStateCard";
import { 
  Calendar, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  AlertCircle,
  RefreshCw,
  Download,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMaintenance } from "@/hooks/useMaintenance";
import { toast } from "sonner";

// Constants for better maintainability
const SEARCH_DEBOUNCE_MS = 300;

// Utility function for debounced search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Main Maintenance Page Component
export default function MaintenancePage() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Use the maintenance hook with filters
  const filters = useMemo(() => ({
    search: debouncedSearchTerm,
  }), [debouncedSearchTerm]);

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => {
    return maintenanceColumns;
  }, []);

  const {
    data: maintenance,
    stats,
    isLoading,
    isStatsLoading,
    error,
    refetch,
    isFetching,
    isEmpty,
    hasFilters,
    createMaintenance,
    isCreating,
  } = useMaintenance({ filters });

  // Table configuration
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: maintenance,
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

  const handleScheduleSuccess = useCallback(() => {
    setIsScheduleDialogOpen(false);
    toast.success("Maintenance scheduled successfully!");
  }, []);

  const handleCreateNew = useCallback(() => {
    setIsScheduleDialogOpen(true);
  }, []);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch("/api/maintenance/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `maintenance-${new Date().toISOString().split("T")[0]}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Maintenance records exported successfully");
    } catch (error) {
      console.error("Error exporting maintenance:", error);
      toast.error("Failed to export maintenance records");
    }
  }, []);

  // Memoized card data
  const cardData = useMemo(
    () => [
      {
        title: "Scheduled",
        value: (stats as any)?.scheduled || 0,
        subtitle: "Upcoming maintenance",
        color: "info" as const,
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        title: "In Progress",
        value: (stats as any)?.inProgress || 0,
        subtitle: "Currently active",
        color: "warning" as const,
        icon: <Clock className="w-4 h-4" />,
      },
      {
        title: "Completed",
        value: (stats as any)?.completed || 0,
        subtitle: "Finished tasks",
        color: "success" as const,
        icon: <CheckCircle className="w-4 h-4" />,
      },
      {
        title: "Overdue",
        value: (stats as any)?.overdue || 0,
        subtitle: "Past due date",
        color: "danger" as const,
        icon: <AlertTriangle className="w-4 h-4" />,
      },
    ],
    [stats],
  );

  // Loading state
  if (isLoading || isStatsLoading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/maintenance">Maintenance</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="Maintenance"
          subtitle="Manage and track maintenance activities for your assets"
          icon={<Settings className="w-4 h-4" />}
        />

        <StatusCardPlaceholder />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <DataTable columns={columns} data={[]} isLoading={true} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/maintenance">Maintenance</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="Maintenance"
          subtitle="Manage and track maintenance activities for your assets"
          icon={<Settings className="w-4 h-4" />}
        />

        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Failed to load maintenance data
              </h3>
              <p className="text-gray-600 mb-4">
                {error.message || "An unexpected error occurred"}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
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
              <Link href="/maintenance">Maintenance</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Maintenance"
        subtitle="Manage and track maintenance activities for your assets"
        icon={<Settings className="w-4 h-4" />}
      />

      <StatusCards cards={cardData} columns={4} />

      <div className="space-y-4">
        <DataTableHeader
          table={table}
          addNewText="Schedule Maintenance"
          onAddNew={handleCreateNew}
          onExport={handleExport}
          isLoading={isLoading || isPending}
          filterPlaceholder="Search maintenance records..."
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
        />

        {maintenance.length === 0 && !isLoading ? (
          <EmptyStateCard
            icon={Settings}
            title="No Maintenance Records Yet"
            description="Schedule your first maintenance to track asset health, costs, and carbon footprint. Regular maintenance helps extend asset life and optimize performance."
            actionText="Schedule Maintenance"
            onAction={handleCreateNew}
          />
        ) : (
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
                          <DataTable
              columns={columns}
              data={maintenance}
              isLoading={isLoading || isPending}
            />
            </CardContent>
          </Card>
        )}
      </div>

             {/* Schedule Maintenance Dialog */}
       <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
         <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Schedule New Maintenance</DialogTitle>
             <DialogDescription>
               Fill out the details below to schedule a new maintenance event for an asset.
               This will help track maintenance costs, carbon footprint, and asset health.
             </DialogDescription>
           </DialogHeader>
           <div className="py-4">
             <MaintenanceForm 
               onSuccess={handleScheduleSuccess}
             />
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
} 