"use client";

import React, { useState, useMemo, useCallback, Suspense } from "react";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { maintenanceColumns } from "@/components/tables/MaintenanceColumns";
import { MaintenanceForm } from "@/components/forms/MaintenanceForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Leaf,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

// Loading Skeleton Components
const StatsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const TableLoadingSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Stats Card Component
const StatCard = React.memo(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  color = "blue", 
  loading = false 
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  loading?: boolean;
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = "StatCard";

// Main Maintenance Page Component
export default function MaintenancePage() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use the maintenance hook with filters
  const filters = useMemo(() => ({
    search: debouncedSearchTerm,
    status: statusFilter,
  }), [debouncedSearchTerm, statusFilter]);

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

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = [...maintenance];

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case "assetName":
          aValue = a.asset.name;
          bValue = b.asset.name;
          break;
        case "status":
          aValue = a.statusLabel.name;
          bValue = b.statusLabel.name;
          break;
        case "cost":
          aValue = a.totalCost || a.cost || 0;
          bValue = b.totalCost || b.cost || 0;
          break;
        default:
          aValue = a[sortBy as keyof typeof a];
          bValue = b[sortBy as keyof typeof b];
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortOrder === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [maintenance, sortBy, sortOrder]);

  const handleScheduleSuccess = useCallback(() => {
    setIsScheduleDialogOpen(false);
    toast.success("Maintenance scheduled successfully!");
  }, []);

     const handleExport = useCallback(() => {
     const csvContent = [
       ["Title", "Asset", "Status", "Scheduled", "Cost", "CO2 Impact"].join(","),
       ...processedData.map(item => [
         item.title,
         item.asset.name,
         item.statusLabel.name,
         new Date(item.startDate).toLocaleDateString(),
         item.totalCost || item.cost || 0,
         item.co2eRecords?.reduce((sum: number, record: any) => sum + Number(record.co2e), 0) || 0
       ].join(","))
     ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [processedData]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter([]);
  }, []);

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600 mt-1">
            Manage and track maintenance activities for your assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            disabled={isEmpty}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => setIsScheduleDialogOpen(true)}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <ErrorBoundary isolate fallback={<StatsLoadingSkeleton />}>
        <Suspense fallback={<StatsLoadingSkeleton />}>
          {isStatsLoading ? (
            <StatsLoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             <StatCard
                 title="Scheduled"
                 value={(stats as any)?.scheduled || 0}
                 description="Upcoming maintenance"
                 icon={Calendar}
                 color="blue"
               />
               <StatCard
                 title="In Progress"
                 value={(stats as any)?.inProgress || 0}
                 description="Currently active"
                 icon={Clock}
                 color="amber"
               />
               <StatCard
                 title="Completed"
                 value={(stats as any)?.completed || 0}
                 description="Finished tasks"
                 icon={CheckCircle}
                 color="green"
               />
               <StatCard
                 title="Overdue"
                 value={(stats as any)?.overdue || 0}
                 description="Past due date"
                 icon={AlertTriangle}
                 color="red"
               />
            </div>
          )}
        </Suspense>
      </ErrorBoundary>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Filters & Search
            </CardTitle>
            {hasFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search maintenance records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter.length > 0 ? statusFilter.join(",") : "all"}
              onValueChange={(value) => setStatusFilter(value === "all" ? [] : value.split(","))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order as "asc" | "desc");
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startDate-desc">Latest First</SelectItem>
                <SelectItem value="startDate-asc">Oldest First</SelectItem>
                <SelectItem value="assetName-asc">Asset A-Z</SelectItem>
                <SelectItem value="assetName-desc">Asset Z-A</SelectItem>
                <SelectItem value="status-asc">Status A-Z</SelectItem>
                <SelectItem value="cost-desc">Cost High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Table */}
      <ErrorBoundary isolate fallback={<TableLoadingSkeleton />}>
        <Suspense fallback={<TableLoadingSkeleton />}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Maintenance Records
                  {maintenance.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {maintenance.length} record{maintenance.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                {isFetching && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Updating...
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableLoadingSkeleton />
              ) : isEmpty ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {hasFilters ? "No maintenance records match your filters" : "No maintenance records yet"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {hasFilters 
                      ? "Try adjusting your search or filter criteria"
                      : "Schedule your first maintenance to get started"
                    }
                  </p>
                  {hasFilters ? (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => setIsScheduleDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  )}
                </div>
              ) : (
                <DataTable
                  columns={maintenanceColumns}
                  data={processedData}
                />
              )}
            </CardContent>
          </Card>
        </Suspense>
      </ErrorBoundary>

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