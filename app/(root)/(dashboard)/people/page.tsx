"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useDialogStore } from "@/lib/stores/store";
import { useUserStore } from "@/lib/stores/userStore";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import UserForm from "@/components/forms/UserForm";
import { useRoleStore } from "@/lib/stores/roleStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { peopleColumns } from "@/components/tables/PeopleColumns";
import { TableHeader } from "@/components/tables/TableHeader";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { BsDisplay } from "react-icons/bs";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Laptop, UserPlus } from "lucide-react";

const People = () => {
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const [users, loading] = useUserStore((state) => [
    state.users,
    state.loading,
  ]);

  const [fetchRoles] = useRoleStore((state) => [state.getAll]);

  const navigate = useRouter();
  const handleView = async (id: string) => {
    navigate.push(`/people/view/${id}`);
  };
  const handleFilter = () => {
    setFilterDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(users);
      return;
    }

    const searchResults = users.filter((item: any) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string" || typeof val === "number") {
          return val.toString().toLowerCase().includes(value.toLowerCase());
        }
        return false;
      }),
    );
    setFilteredData(searchResults);
  };

  const handleDelete = async (id: string) => {};
  const onDelete = useCallback((user: User) => handleDelete(user?.id!), []);
  const onView = useCallback((user: User) => handleView(user?.id!), []);
  const columns = useMemo(() => peopleColumns({ onDelete, onView }), []);
  const [filteredData, setFilteredData] = useState(users);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });
  useEffect(() => {
    useUserStore.getState().getAll();
    fetchRoles();
  }, []);

  useEffect(() => {
    setFilteredData(users);
  }, [users]);
  return (
    <div className="p-6 space-y-6">
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
      {/* Header Section */}
      <HeaderBox
        title="People"
        subtext="Manage and track people"
        icon={<BsDisplay className="w-4 h-4" />}
      />

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Employees</p>
              <p className="text-3xl font-bold">24</p>
              <div className="flex items-center text-sm text-gray-500">
                <UserPlus className="h-4 w-4 mr-1" />
                <span>3 new this month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-3xl font-bold">5</p>
              <div className="flex items-center text-sm text-gray-500">
                <Building2 className="h-4 w-4 mr-1" />
                <span>Active departments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Assigned Assets</p>
              <p className="text-3xl font-bold">18</p>
              <div className="flex items-center text-sm text-gray-500">
                <Laptop className="h-4 w-4 mr-1" />
                <span>75% of total assets</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title={"New User"}
        description={"Register a new user for your organization."}
        form={<UserForm />}
      />
      <div className="space-y-6">
        <section className="flex w-full flex-col gap-6">
          {loading ? (
            <TableHeaderSkeleton />
          ) : (
            <TableHeader
              onSearch={handleSearch}
              onFilter={handleFilter}
              onImport={() => {}}
              onCreateNew={openDialog}
            />
          )}
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={loading}
          />
        </section>
      </div>
    </div>
  );
};
export default People;
