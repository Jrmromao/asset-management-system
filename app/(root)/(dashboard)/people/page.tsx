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

const People = () => {
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const [users] = useUserStore((state) => [state.users, state.findById]);
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
    <div className="assets">
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
      <div className="transactions-header">
        <HeaderBox title="People" subtext="Manage asset assignees." />
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
          <TableHeader
            onSearch={handleSearch}
            onFilter={handleFilter}
            onImport={() => {}}
            onCreateNew={openDialog}
          />
          <DataTable columns={columns} data={filteredData} />
        </section>
      </div>
    </div>
  );
};
export default People;
