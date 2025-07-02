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
import { assetColumns } from "@/components/tables/AssetColumns";
import type { EnhancedAssetType } from "@/lib/services/asset.service";
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
import { Calendar } from "lucide-react";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { DataTableHeader } from "@/components/tables/TableHeader";
import FilterDialog from "@/components/dialogs/FilterDialog";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";
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
import BulkImportDialog from "@/components/forms/BulkImportDialog";
import { assetImportConfig } from "@/importConfigs/assetImportConfig";
import { bulkCreateAssets } from "@/lib/actions/assets.actions";
import { useQueryClient } from "@tanstack/react-query";

// Constants for better maintainability
const SEARCH_DEBOUNCE_MS = 300;
const MAINTENANCE_DAYS_THRESHOLD = 30;
const ACTIVE_STATUS = "Inactive";

// Type definitions
interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  status?: string;
  model?: { id: string; name: string } | null;
  statusLabel?: { id: string; name: string } | null;
  endOfLife?: Date | null;
  updatedAt: Date;
  co2eRecords?: Array<{
    id: string;
    co2e: number;
    units: string;
    co2eType: string;
    sourceOrActivity: string;
    description: string | null;
    details: string | null;
  }>;
  userId?: string | null;
  user?: any;
}

interface Model {
  name: string;
}

interface StatusLabel {
  name: string;
}

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
const searchAssets = (assets: Asset[], searchTerm: string): Asset[] => {
  if (!searchTerm.trim()) return assets;

  const searchLower = searchTerm.toLowerCase();
  const searchableFields = [
    "name",
    "serialNumber",
    "status",
    "model.name",
    "statusLabel.name",
  ];

  return assets.filter((asset) => {
    return searchableFields.some((field) => {
      const value = getNestedValue(asset, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Memoized active assets filter
const getActiveAssets = (assets: Asset[]): Asset[] => {
  return assets.filter((asset) => asset.status !== ACTIVE_STATUS);
};

const normalizeAssets = (assets: any[]) =>
  assets.map((asset) => ({
    ...asset,
    co2eRecords: asset.co2eRecords?.map((rec: any) => ({
      ...rec,
      co2e:
        typeof rec.co2e === "object" &&
        rec.co2e !== null &&
        "toNumber" in rec.co2e
          ? rec.co2e.toNumber()
          : Number(rec.co2e),
    })),
  }));

// Helper function for maintenance due calculation
function calculateMaintenanceDue(assets: Asset[], daysThreshold: number): number {
  const now = new Date();
  const thresholdDate = new Date(now);
  thresholdDate.setDate(now.getDate() + daysThreshold);

  return assets.filter((asset: Asset) => {
    if (!asset.endOfLife) return false;
    const endOfLifeDate = new Date(asset.endOfLife);
    return endOfLifeDate >= now && endOfLifeDate <= thresholdDate;
  }).length;
}

const Assets = () => {
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Use paginated asset query
  const {
    items: assetsData,
    isLoading: loading,
    error,
    refresh,
    deleteItem,
  } = useAssetQuery({
    pageIndex,
    pageSize,
    search: debouncedSearchTerm,
    // Add sort, status, department, model as needed
  })();
  // Use _pagination property attached to data array
  const pagination = (assetsData as any)?._pagination || { total: 0, page: 1, pageSize: 10 };
  const total = pagination.total;

  // Table configuration
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const handleView = useCallback(
    (id: string) => {
      startTransition(() => {
        navigate.push(`/assets/view/${id}`);
      });
    },
    [navigate],
  );

  const onDelete = useCallback(
    (asset: EnhancedAssetType) => {
      if (asset?.id) {
        deleteItem(asset.id);
      }
    },
    [deleteItem],
  );

  const onView = useCallback(
    (asset: EnhancedAssetType) => {
      if (asset?.id) {
        handleView(asset.id);
      }
    },
    [handleView],
  );

  // Pagination handler
  const handlePaginationChange = useCallback(
    ({ pageIndex: newPageIndex, pageSize: newPageSize }: { pageIndex: number; pageSize: number }) => {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    },
    [],
  );

  const handleCreateNew = useCallback(() => {
    startTransition(() => {
      navigate.push("/assets/create");
    });
  }, [navigate]);

  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const openImportModal = () => {
    setImportDialogOpen(true);
  };

  const queryClient = useQueryClient();

  // Memoized columns to prevent unnecessary re-renders
  const handleCo2Update = useCallback((assetId: string, newCo2Record: any) => {
    // Invalidate React Query cache to refetch updated asset data
    queryClient.invalidateQueries({ queryKey: ["assets"] });
  }, [queryClient]);

  const columns = useMemo(() => {
    return assetColumns({ onDelete, onView, onCo2Update: handleCo2Update }) as ColumnDef<EnhancedAssetType>[];
  }, [onDelete, onView, handleCo2Update]);

  const handleBulkImport = async (data: any[]) => {
    try {
      const result = await bulkCreateAssets(data);
      if (result.success) {
        toast.success(`Assets imported successfully`);
        queryClient.invalidateQueries({ queryKey: ["assets"] });
      } else {
        toast.error(`Failed to import assets. ${result.error || ''}`);
      }
    } catch (err: any) {
      toast.error(`Bulk import failed: ${err.message || err}`);
    } finally {
    setImportDialogOpen(false);
    }
  };

  // Memoized computed values
  const activeAssets = useMemo(
    () => getActiveAssets(normalizeAssets(assetsData)),
    [assetsData],
  );

  // Available assets: assets not assigned to a user
  const availableAssets = useMemo(
    () =>
      activeAssets.filter(
        (asset) => !asset.userId && !asset.user // covers both missing userId and user object
      ),
    [activeAssets],
  );

  // Memoized card data
  const cardData = useMemo(
    () => [
      {
        title: "Total Assets",
        value: assetsData.length,
        color: "info" as const,
      },
      {
        title: "Available Assets",
        value: availableAssets.length,
        percentage: (availableAssets.length / assetsData.length) * 100,
        total: assetsData.length,
        color: "success" as const,
      },
      {
        title: "Upcoming Maintenance",
        value: calculateMaintenanceDue(activeAssets, MAINTENANCE_DAYS_THRESHOLD),
        subtitle: "Due within 30 days",
        color: "warning" as const,
      },
    ],
    [assetsData.length, availableAssets.length],
  );

  // Table configuration
  const table = useReactTable({
    data: assetsData,
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
      const response = await fetch("/api/assets/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `assets-${new Date().toISOString().split("T")[0]}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Assets exported successfully");
    } catch (error) {
      console.error("Error exporting assets:", error);
      toast.error("Failed to export assets");
    }
  }, []);

  // 3. For FilterDialog, provide the required shape
  const [filters, setFilters] = useState({ supplier: '', inventory: '' });

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/assets">Assets</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="Assets"
          subtitle="Manage and track your assets"
          icon={<Calendar className="w-4 h-4" />}
        />

        <StatusCardPlaceholder />
        <TableHeaderSkeleton />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={[]}
              isLoading={true}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPaginationChange={handlePaginationChange}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 dark:bg-gray-900">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/assets">Assets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Assets"
        subtitle="Manage and track your assets"
        icon={<Calendar className="w-4 h-4" />}
      />

      <StatusCards cards={cardData} columns={3} />

      <div className="space-y-4">
        <DataTableHeader
          table={table}
          addNewText="Add Asset"
          onAddNew={handleCreateNew}
          onImport={openImportModal}
          onExport={handleExport}
          isLoading={loading || isPending}
          filterPlaceholder="Search assets..."
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
          searchColumnId="name"
        />
        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={assetsData}
              isLoading={loading || isPending}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPaginationChange={handlePaginationChange}
            />
          </CardContent>
        </Card>
      </div>

      <FilterDialog
        open={isOpen}
        onOpenChange={closeDialog}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={() => {
          closeDialog();
        }}
        title="Filter Assets"
      />

      <BulkImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        config={{
          ...assetImportConfig,
          companyId: "1",
        }}
        onImport={handleBulkImport}
      />
    </div>
  );
};

export default Assets;
