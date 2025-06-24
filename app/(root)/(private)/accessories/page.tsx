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
import { accessoriesColumns } from "@/components/tables/AccessoriesColumns";
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
import { BsDisplay } from "react-icons/bs";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import TableHeader, { DataTableHeader } from "@/components/tables/TableHeader";
import FilterDialog from "@/components/dialogs/FilterDialog";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useAccessoryQuery } from "@/hooks/queries/useAccessoryQuery";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "postcss";
import { Button } from "react-day-picker";

// Constants for better maintainability
const SEARCH_DEBOUNCE_MS = 300;
const LOW_STOCK_THRESHOLD = 10;

// Type definitions
interface Accessory {
  id: string;
  name: string;
  quantity?: number;
  minQuantity?: number;
  statusLabel?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
  inventory?: { id: string; name: string } | null;
  updatedAt: Date;
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
const searchAccessories = (accessories: Accessory[], searchTerm: string): Accessory[] => {
  if (!searchTerm.trim()) return accessories;

  const searchLower = searchTerm.toLowerCase();
  const searchableFields = [
    "name",
    "statusLabel.name",
    "supplier.name",
    "inventory.name",
  ];

  return accessories.filter((accessory) => {
    return searchableFields.some((field) => {
      const value = getNestedValue(accessory, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

const Accessories = () => {
  const {
    accessories,
    isLoading,
    deleteItem,
  } = useAccessoryQuery();

  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();

  // State management
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });

  // Event handlers
  const handleView = useCallback(
    (id: string) => {
      startTransition(() => {
        navigate.push(`/accessories/view/${id}`);
      });
    },
    [navigate],
  );

  const onDelete = useCallback(
    (accessory: Accessory) => {
      if (accessory?.id) {
        deleteItem(accessory.id);
      }
    },
    [deleteItem],
  );

  const onView = useCallback(
    (accessory: Accessory) => {
      if (accessory?.id) {
        handleView(accessory.id);
      }
    },
    [handleView],
  );

  const handleCreateNew = useCallback(() => {
    startTransition(() => {
      navigate.push("/accessories/create");
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
    return accessoriesColumns({ onDelete, onView }) as ColumnDef<Accessory>[];
  }, [onDelete, onView]);

  // Memoized computed values
  const allAccessories = useMemo(() => accessories || [], [accessories]);

  const filteredData = useMemo(() => {
    return allAccessories;
  }, [allAccessories]);

  const availableAccessories = useMemo(
    () =>
      allAccessories.filter(
        (accessory) => accessory.statusLabel?.name.toUpperCase() === "AVAILABLE",
      ),
    [allAccessories],
  );

  const lowStockAccessories = useMemo(() => {
    return allAccessories.filter((accessory: any) => {
      const quantity = accessory.quantity || 0;
      const minQuantity = accessory.minQuantity || LOW_STOCK_THRESHOLD;
      return quantity <= minQuantity;
    }).length;
  }, [allAccessories]);

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
      const response = await fetch("/api/accessories/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `accessories-${new Date().toISOString().split("T")[0]}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Accessories exported successfully");
    } catch (error) {
      console.error("Error exporting accessories:", error);
      toast.error("Failed to export accessories");
    }
  }, []);

  // Memoized card data
  const cardData = useMemo(
    () => [
      {
        title: "Total Accessories",
        value: allAccessories.length,
        color: "info" as const,
      },
      {
        title: "Available Accessories",
        value: availableAccessories.length,
        percentage: allAccessories.length > 0 ? (availableAccessories.length / allAccessories.length) * 100 : 0,
        total: allAccessories.length,
        color: "success" as const,
      },
      {
        title: "Low Stock",
        value: lowStockAccessories,
        subtitle: "Need reordering",
        color: "warning" as const,
      },
    ],
    [allAccessories.length, availableAccessories.length, lowStockAccessories],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/accessories">Accessories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="Accessories"
          subtitle="Manage and track your accessories"
          icon={<BsDisplay className="w-4 h-4" />}
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
              <Link href="/accessories">Accessories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Accessories"
        subtitle="Manage and track your accessories"
        icon={<BsDisplay className="w-4 h-4" />}
      />

      <StatusCards cards={cardData} columns={3} />

      <div className="space-y-4">
        <DataTableHeader
          table={table}
          addNewText="Add Accessory"
          onAddNew={handleCreateNew}
          onImport={handleImport}
          onExport={handleExport}
          isLoading={isLoading || isPending}
          searchPlaceholder="Search accessories..."
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
        />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            {allAccessories.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <BsDisplay className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No accessories yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Start managing your accessories by adding your first accessory.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <BsDisplay className="w-4 h-4 mr-2" />
                  Add First Accessory
                </button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredData}
                isLoading={isLoading || isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
        title="Filter Accessories"
      />

      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="Import Accessories"
        description="Import accessories from a CSV file"
        form={<FileUploadForm dataType="accessories" />}
      />
    </div>
  );
};

export default Accessories;
