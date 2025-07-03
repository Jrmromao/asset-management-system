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
import { peopleColumns } from "@/components/tables/PeopleColumns";
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
import { Users } from "lucide-react";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { DataTableHeader } from "@/components/tables/TableHeader";
import FilterDialog from "@/components/dialogs/FilterDialog";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import UserForm from "@/components/forms/UserForm";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import {
  PermissionGuard,
  UserActions,
} from "@/components/auth/PermissionGuard";
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
const INACTIVE_STATUS = "DISABLED"; // Only exclude DISABLED users, not INVITED

// Type definitions - Use any to avoid conflicts with Prisma types
type UserWithRole = any;

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
const searchUsers = (
  users: UserWithRole[],
  searchTerm: string,
): UserWithRole[] => {
  if (!searchTerm.trim()) return users;

  const searchLower = searchTerm.toLowerCase();
  const searchableFields = [
    "name",
    "email",
    "firstName",
    "lastName",
    "title",
    "employeeId",
    "role.name",
    "company.name",
  ];

  return users.filter((user) => {
    return searchableFields.some((field) => {
      const value = getNestedValue(user, field);
      return value && value.toString().toLowerCase().includes(searchLower);
    });
  });
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Memoized active users filter
const getActiveUsers = (users: UserWithRole[]): UserWithRole[] => {
  // Only filter out DISABLED users - INVITED and ACTIVE users should be shown
  return users.filter((user) => {
    // If status field exists, only exclude DISABLED users
    if (user.status) {
      return user.status.toUpperCase() !== INACTIVE_STATUS;
    }
    // Otherwise, consider all users as active (they exist in the system)
    return true;
  });
};

const People = () => {
  const {
    isLoading,
    users,
    deleteItem,
    totalUsers,
    newThisMonth,
    uniqueRoles,
  } = useUserQuery();

  const permissions = usePermissions();

  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const navigate = useRouter();
  const [isPending, startTransition] = useTransition();

  // Debug: Log the users data to understand structure (can be removed in production)
  useEffect(() => {
    console.log("🔍 [People Component] - Users data:", {
      isLoading,
      usersCount: users?.length || 0,
      users: users?.slice(0, 2), // Log first 2 users for structure
      usersArray: users,
    });
  }, [users, isLoading]);

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
        navigate.push(`/people/view/${id}`);
      });
    },
    [navigate],
  );

  const onDelete = useCallback(
    (user: UserWithRole) => {
      if (user?.id) {
        deleteItem(user.id);
      }
    },
    [deleteItem],
  );

  const onView = useCallback(
    (user: UserWithRole) => {
      if (user?.id) {
        handleView(user.id);
      }
    },
    [handleView],
  );

  const handleCreateNew = useCallback(() => {
    openDialog();
  }, [openDialog]);

  const handleImport = useCallback(() => {
    // Open import dialog - could be implemented later
    toast.info("Import functionality coming soon");
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
    return peopleColumns({ onDelete, onView }) as ColumnDef<UserWithRole>[];
  }, [onDelete, onView]);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

  // Memoized computed values - Fixed to handle actual data structure
  const allUsers = useMemo(() => users || [], [users]);
  const activeUsers = useMemo(() => getActiveUsers(allUsers), [allUsers]);

  const filteredData = useMemo(() => {
    const searchFiltered = searchUsers(activeUsers, debouncedSearchTerm);
    return searchFiltered;
  }, [activeUsers, debouncedSearchTerm]);

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
      const response = await fetch("/api/users/export", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;

      a.style.display = "none";
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("Users exported successfully");
    } catch (error) {
      console.error("Error exporting users:", error);
      toast.error("Failed to export users");
    }
  }, []);

  // Memoized card data using metrics from the hook
  const cardData = useMemo(() => {
    const hasUsers = totalUsers > 0;

    const data = [
      {
        title: "Total Employees",
        value: totalUsers,
        subtitle: hasUsers ? "Active team members" : "No employees yet",
        color: "info" as const,
      },
      {
        title: "New This Month",
        value: newThisMonth,
        subtitle: hasUsers ? "New employees" : "Start inviting team members",
        color: "success" as const,
      },
      {
        title: "Unique Roles",
        value: uniqueRoles,
        subtitle: hasUsers ? "Different positions" : "Set up roles first",
        color: "warning" as const,
      },
    ];

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 [People] - Card data:", {
        totalUsers,
        newThisMonth,
        uniqueRoles,
        cardData: data,
      });
    }
    return data;
  }, [totalUsers, newThisMonth, uniqueRoles]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 dark:bg-gray-900">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/people">People</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>

        <HeaderBox
          title="People"
          subtitle="Manage and track your team members"
          icon={<Users className="w-4 h-4" />}
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
              <Link href="/people">People</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      <HeaderBox
        title="People"
        subtitle="Manage and track your team members"
        icon={<Users className="w-4 h-4" />}
      />

      <StatusCards cards={cardData} columns={3} />

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === "development" && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
            Debug Info:
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Users array length: {users?.length || 0} | Active users:{" "}
            {activeUsers?.length || 0} | Loading: {isLoading ? "Yes" : "No"}
          </p>
          {users?.length === 0 && !isLoading && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              No users found. Check console for detailed logs or visit
              /api/debug/users
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <DataTableHeader
          table={table}
          addNewText="Add Employee"
          onAddNew={permissions.canInviteUsers ? handleCreateNew : undefined}
          onImport={permissions.canInviteUsers ? handleImport : undefined}
          onExport={permissions.canExportUsers ? handleExport : undefined}
          isLoading={isLoading || isPending}
          filterPlaceholder="Search people..."
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
          showFilter={false}
        />

        <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            {activeUsers.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No team members yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                  Start building your team by inviting employees to join your
                  organization.
                </p>
                <UserActions action="invite">
                  <button
                    onClick={handleCreateNew}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Invite First Employee
                  </button>
                </UserActions>
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
        title="Filter People"
      />

      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="New Employee"
        description="Register a new team member for your organization."
        form={null}
        body={<UserForm />}
      />
    </div>
  );
};

export default People;
