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

const Assets = () => {
  const {
    isLoading,
    items: assets,
    deleteItem,
    createItem,
  } = useAssetQuery()();

  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });

  // --- Add local state for assets to allow real-time updates ---
  const [localAssets, setLocalAssets] = useState<any[]>([]);
  useEffect(() => {
    setLocalAssets(assets);
  }, [assets]);

  // --- Real-time CO2 update handler ---
  const handleCo2Update = useCallback((assetId: string, newCo2Record: any) => {
    setLocalAssets((prevAssets) =>
      prevAssets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              co2eRecords: [newCo2Record, ...(asset.co2eRecords?.filter((r: any) => r.id !== newCo2Record.id) || [])],
            }
          : asset
      )
    );
  }, []);

  // Event handlers
  const handleView = useCallback(
    (id: string) => {
      startTransition(() => {
        navigate.push(`/assets/view/${id}`);
      });
    },
    [navigate],
  );

  const onDelete = useCallback(
    (asset: Asset) => {
      if (asset?.id) {
        deleteItem(asset.id);
      }
    },
    [deleteItem],
  );

  const onView = useCallback(
    (asset: Asset) => {
      if (asset?.id) {
        handleView(asset.id);
      }
    },
    [handleView],
  );

  const handleCreateNew = useCallback(() => {
    startTransition(() => {
      navigate.push("/assets/create");
    });
  }, [navigate]);

  const handleImport = useCallback(() => {
    openDialog();
  }, [openDialog]);

  const applyFilters = useCallback(() => {
    // Filter logic can be implemented here
    setFilterDialogOpen(false);
  }, []);

  // Table configuration
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Memoized columns to prevent unnecessary re-renders
  const columns = useMemo(() => {
    return assetColumns({ onDelete, onView, onCo2Update: handleCo2Update }) as ColumnDef<Asset>[];
  }, [onDelete, onView, handleCo2Update]);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Memoized computed values
  const activeAssets = useMemo(
    () => getActiveAssets(normalizeAssets(localAssets)),
    [localAssets],
  );

  const filteredData = useMemo(() => {
    const searchFiltered = searchAssets(activeAssets, debouncedSearchTerm);
    return searchFiltered;
  }, [activeAssets, debouncedSearchTerm]);

  const availableAssets = useMemo(
    () =>
      activeAssets.filter(
        (asset) => asset.statusLabel?.name.toUpperCase() === "AVAILABLE",
      ),
    [activeAssets],
  );

  const maintenanceDue = useMemo(() => {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + MAINTENANCE_DAYS_THRESHOLD);

    return activeAssets.filter((asset) => {
      const maintenanceDate = asset.endOfLife || asset.updatedAt;
      return maintenanceDate && new Date(maintenanceDate) <= thresholdDate;
    }).length;
  }, [activeAssets]);

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

  // Memoized card data
  const cardData = useMemo(
    () => [
      {
        title: "Total Assets",
        value: assets.length,
        color: "info" as const,
      },
      {
        title: "Available Assets",
        value: availableAssets.length,
        percentage: (availableAssets.length / assets.length) * 100,
        total: assets.length,
        color: "success" as const,
      },
      {
        title: "Maintenance Due",
        value: maintenanceDue,
        subtitle: "Due within 30 days",
        color: "warning" as const,
      },
    ],
    [assets.length, availableAssets.length, maintenanceDue],
  );

  // Loading state
  if (isLoading) {
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
            <DataTable columns={columns} data={[]} isLoading={true} />
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
          onImport={handleImport}
          onExport={handleExport}
          isLoading={isLoading || isPending}
          filterPlaceholder="Search assets..."
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
          searchColumnId="name"
        />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredData}
              isLoading={isLoading || isPending}
            />
          </CardContent>
        </Card>
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
        title="Filter Assets"
      />

      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="Import Assets"
        description="Import assets from a CSV file"
        form={<FileUploadForm dataType="assets" />}
      />
    </div>
  );
};

export default Assets;
