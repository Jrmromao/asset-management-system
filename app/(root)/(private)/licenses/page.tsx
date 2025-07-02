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
import { licenseColumns } from "@/components/tables/LicensesColumns";
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
import { FileCheck } from "lucide-react";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { DataTableHeader } from "@/components/tables/TableHeader";
import FilterDialog from "@/components/dialogs/FilterDialog";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";
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
const EXPIRING_DAYS_THRESHOLD = 30;

// Type definitions
interface License {
  id: string;
  name: string;
  licensedEmail?: string;
  seats?: number;
  statusLabel?: { id: string; name: string } | null;
  renewalDate?: Date | null;
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
const searchLicenses = (licenses: License[], searchTerm: string): License[] => {
  if (!searchTerm.trim()) return licenses;

  const searchLower = searchTerm.toLowerCase();
  const searchableFields = ["name", "licensedEmail", "statusLabel.name"];

  return licenses.filter((license) => {
    return searchableFields.some((field) => {
      const value = getNestedValue(license, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

const Licenses = () => {
  const { licenses, isLoading, deleteItem } = useLicenseQuery();

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

  // Event handlers
  const handleView = useCallback(
    (id: string) => {
      startTransition(() => {
        navigate.push(`/licenses/view/${id}`);
      });
    },
    [navigate],
  );

  const onDelete = useCallback(
    (license: License) => {
      if (license?.id) {
        deleteItem(license.id);
      }
    },
    [deleteItem],
  );

  const onView = useCallback(
    (license: License) => {
      if (license?.id) {
        handleView(license.id);
      }
    },
    [handleView],
  );

  const handleCreateNew = useCallback(() => {
    startTransition(() => {
      navigate.push("/licenses/create");
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
    return licenseColumns({ onDelete, onView }) as ColumnDef<License>[];
  }, [onDelete, onView]);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Memoized computed values
  const allLicenses = useMemo(() => licenses || [], [licenses]);

  const filteredData = useMemo(() => {
    const searchFiltered = searchLicenses(allLicenses, debouncedSearchTerm);
    return searchFiltered;
  }, [allLicenses, debouncedSearchTerm]);

  const availableLicenses = useMemo(
    () =>
      allLicenses.filter(
        (license) => license.statusLabel?.name.toUpperCase() === "AVAILABLE",
      ),
    [allLicenses],
  );

  const expiringLicenses = useMemo(() => {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + EXPIRING_DAYS_THRESHOLD);

    return allLicenses.filter((license) => {
      const renewalDate = license.renewalDate;
      return renewalDate && new Date(renewalDate) <= thresholdDate;
    }).length;
  }, [allLicenses]);

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
      const response = await fetch("/api/licenses/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `licenses-${new Date().toISOString().split("T")[0]}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Licenses exported successfully");
    } catch (error) {
      console.error("Error exporting licenses:", error);
      toast.error("Failed to export licenses");
    }
  }, []);

  // Memoized card data
  const cardData = useMemo(
    () => [
      {
        title: "Total Licenses",
        value: allLicenses.length,
        color: "info" as const,
      },
      {
        title: "Available Licenses",
        value: availableLicenses.length,
        percentage:
          allLicenses.length > 0
            ? (availableLicenses.length / allLicenses.length) * 100
            : 0,
        total: allLicenses.length,
        color: "success" as const,
      },
      {
        title: "Expiring Soon",
        value: expiringLicenses,
        subtitle: "Due within 30 days",
        color: "warning" as const,
      },
    ],
    [allLicenses.length, availableLicenses.length, expiringLicenses],
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/licenses">Licenses</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="Licenses"
          subtitle="Manage and track your software licenses"
          icon={<FileCheck className="w-4 h-4" />}
        />

        <StatusCardPlaceholder />
        <TableHeaderSkeleton />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <DataTable
              pageIndex={0}
              pageSize={10}
              total={0}
              onPaginationChange={() => {}}
              columns={columns}
              data={[]}
              isLoading={true}
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
              <Link href="/licenses">Licenses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="Licenses"
        subtitle="Manage and track your software licenses"
        icon={<FileCheck className="w-4 h-4" />}
      />

      <StatusCards cards={cardData} columns={3} />

      <div className="space-y-4">
        <DataTableHeader
          table={table}
          addNewText="Add License"
          onAddNew={handleCreateNew}
          onImport={handleImport}
          onExport={handleExport}
          isLoading={isLoading || isPending}
          filterPlaceholder="Search licenses..."
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
        />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            {allLicenses.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <FileCheck className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No licenses yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Start managing your software licenses by adding your first
                  license.
                </p>
                <button
                  onClick={handleCreateNew}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Add First License
                </button>
              </div>
            ) : (
              <DataTable
                pageIndex={0}
                pageSize={10}
                total={filteredData.length}
                onPaginationChange={() => {}}
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
        title="Filter Licenses"
      />

      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="Import Licenses"
        description="Import licenses from a CSV file"
        form={<FileUploadForm dataType="licenses" />}
      />
    </div>
  );
};

export default Licenses;
