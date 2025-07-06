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
import {
  useLicenseQuery,
  useAllLicensesForStats,
} from "@/hooks/queries/useLicenseQuery";
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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

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

// License bulk import config
const licenseImportFields = [
  { name: "name", label: "License Name", type: "string", required: true },
  {
    name: "licensedEmail",
    label: "Licensed Email",
    type: "string",
    required: true,
  },
  { name: "poNumber", label: "PO Number", type: "string", required: false },
  { name: "renewalDate", label: "Renewal Date", type: "date", required: true },
  {
    name: "purchaseDate",
    label: "Purchase Date",
    type: "date",
    required: true,
  },
  {
    name: "purchaseNotes",
    label: "Purchase Notes",
    type: "string",
    required: false,
  },
  { name: "licenseUrl", label: "License URL", type: "string", required: false },
  {
    name: "minSeatsAlert",
    label: "Min Seats Alert",
    type: "number",
    required: false,
  },
  {
    name: "alertRenewalDays",
    label: "Alert Renewal Days",
    type: "number",
    required: false,
  },
  { name: "seats", label: "Seats", type: "number", required: false },
  {
    name: "purchasePrice",
    label: "Purchase Price",
    type: "number",
    required: false,
  },
];
const licenseImportDependencies = [
  {
    name: "statusLabelId",
    label: "Status Label",
    api: "/api/status-labels",
    createApi: "/api/status-labels",
  },
  {
    name: "supplierId",
    label: "Supplier",
    api: "/api/suppliers",
    createApi: "/api/suppliers",
  },
];
const licenseImportValidationSchema = z.object({
  name: z.string().min(1),
  licensedEmail: z.string().email(),
  renewalDate: z.string().min(1),
  purchaseDate: z.string().min(1),
});
const licenseBulkImportConfig = {
  entityType: "license",
  fields: licenseImportFields,
  dependencies: licenseImportDependencies,
  importApi: "/api/licenses/bulk-import",
  templateUrl: "/license-import-template.csv",
  validationSchema: licenseImportValidationSchema,
  companyId: "COMPANY_ID_PLACEHOLDER", // TODO: Replace with actual companyId from context
};

// Add a function to download the template
const handleDownloadLicenseTemplate = () => {
  const headers = [
    "name",
    "licensedEmail",
    "poNumber",
    "renewalDate",
    "purchaseDate",
    "purchaseNotes",
    "licenseUrl",
    "minSeatsAlert",
    "alertRenewalDays",
    "seats",
    "purchasePrice",
    "statusLabelId",
    "supplierId",
  ];
  const csvContent = headers.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "license-import-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

function LicensesPage() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const { licenses, isLoading, deleteItem, total, error } = useLicenseQuery(
    pageIndex,
    pageSize,
    searchTerm,
    filters,
  );
  const { data: allLicensesForStats = [], isLoading: isStatsLoading } =
    useAllLicensesForStats();

  // Debug log
  console.log(
    "licenses",
    licenses,
    "total",
    total,
    "isLoading",
    isLoading,
    "error",
    error,
  );

  // Remove openDialog from useDialogStore for import dialog
  // const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
  //   state.onOpen,
  //   state.onClose,
  //   state.isOpen,
  // ]);
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();

  // State management
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<null | {
    success: number;
    failed: number;
    errors?: any[];
  }>(null);

  const handleLicenseImport = async (data: any) => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const response = await fetch("/api/licenses/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenses: data }),
      });
      const result = await response.json();
      setIsImporting(false);
      if (response.ok) {
        setImportResult(result);
        toast.success(
          `Imported ${result.success} licenses. ${result.failed > 0 ? result.failed + " failed." : ""}`,
        );
        if (result.failed > 0 && result.errors) {
          // Show modal with errors
          setImportDialogOpen(false); // Close import dialog
        } else {
          setImportDialogOpen(false);
        }
      } else {
        setImportResult(result);
        toast.error(result.message || "Bulk import failed");
      }
    } catch (error: any) {
      setIsImporting(false);
      toast.error("Bulk import failed: " + (error?.message || "Unknown error"));
    }
  };

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

  // Use setImportDialogOpen for import dialog
  const handleImport = useCallback(() => {
    setImportDialogOpen(true);
  }, []);

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

  // Always use the array for table and filtering
  let licensesArray: any[] = [];
  if (Array.isArray(licenses)) {
    licensesArray = licenses;
  } else if (licenses && Array.isArray((licenses as any).data)) {
    licensesArray = (licenses as any).data;
  }

  const filteredData = useMemo(() => {
    const searchFiltered = searchLicenses(licensesArray, debouncedSearchTerm);
    return searchFiltered;
  }, [licensesArray, debouncedSearchTerm]);

  // Industry standard: total unassigned seats across all licenses
  const availableSeats = useMemo(() => {
    if (!Array.isArray(allLicensesForStats)) return 0;
    return allLicensesForStats.reduce((sum, license) => {
      const seats = typeof license.seats === "number" ? license.seats : 0;
      const allocated =
        typeof license.seatsAllocated === "number" ? license.seatsAllocated : 0;
      const available = seats - allocated;
      return sum + (available > 0 ? available : 0);
    }, 0);
  }, [allLicensesForStats]);

  const expiringLicenses = useMemo(() => {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + EXPIRING_DAYS_THRESHOLD);

    return Array.isArray(allLicensesForStats)
      ? allLicensesForStats.filter((license) => {
          const renewalDate = license.renewalDate;
          return renewalDate && new Date(renewalDate) <= thresholdDate;
        }).length
      : 0;
  }, [allLicensesForStats]);

  // Pagination handler
  const handlePaginationChange = useCallback(
    ({
      pageIndex: newPageIndex,
      pageSize: newPageSize,
    }: {
      pageIndex: number;
      pageSize: number;
    }) => {
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
    },
    [],
  );

  // Search handler
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setPageIndex(0); // Reset to first page on search
  }, []);

  // Filter handler (for future advanced filters)
  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPageIndex(0); // Reset to first page on filter
  }, []);

  const table = useReactTable({
    data: licensesArray,
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
        value: allLicensesForStats.length,
        color: "info" as const,
      },
      {
        title: "Available Licenses",
        value: availableSeats,
        subtitle: "Unassigned seats",
        color: "success" as const,
      },
      {
        title: "Expiring Soon",
        value: expiringLicenses,
        subtitle: "Due within 30 days",
        color: "warning" as const,
      },
    ],
    [allLicensesForStats.length, availableSeats, expiringLicenses],
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
          searchPlaceholder="Search licenses..."
          onSearch={handleSearch}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
        />

        <Button
          onClick={handleDownloadLicenseTemplate}
          variant="secondary"
          className="mb-2"
        >
          Download License Import CSV Template
        </Button>

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            {licensesArray.length === 0 && !isLoading ? (
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
                pageIndex={pageIndex}
                pageSize={pageSize}
                total={total}
                onPaginationChange={handlePaginationChange}
                columns={columns}
                data={licensesArray}
                isLoading={isLoading || isPending}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters as { supplier: string; inventory: string }}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
        title="Filter Licenses"
      />

      <DialogContainer
        open={isImportDialogOpen}
        onOpenChange={setImportDialogOpen}
        title="Import Licenses"
        description="Import licenses from a CSV file"
        body={
          <BulkImportDialog
            isOpen={isImportDialogOpen}
            onClose={() => setImportDialogOpen(false)}
            config={licenseBulkImportConfig}
            onImport={handleLicenseImport}
            importType="license"
            // isLoading={isImporting} // Remove this line to fix linter error
          />
        }
        form={null}
      />
      {/* Import Result Modal for row-level errors */}
      {importResult && importResult.failed > 0 && importResult.errors && (
        <Dialog open={true} onOpenChange={() => setImportResult(null)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-2">
              Import Completed with Errors
            </h2>
            <p className="mb-4">
              {importResult.success} licenses imported successfully.{" "}
              {importResult.failed} failed.
            </p>
            <div className="overflow-x-auto max-h-64 mb-4">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">Row</th>
                    <th className="px-2 py-1 border">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.errors.map((err, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-1 border">{err.row}</td>
                      <td className="px-2 py-1 border">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={() => setImportResult(null)}>Close</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default LicensesPage;
