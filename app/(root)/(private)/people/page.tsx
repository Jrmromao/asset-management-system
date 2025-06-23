"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useDialogStore } from "@/lib/stores/store";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import UserForm from "@/components/forms/UserForm";
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
import TableHeader from "@/components/tables/TableHeader";
import { Building2, Laptop, UserPlus, Users } from "lucide-react";
import StatusCards from "@/components/StatusCards";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { peopleColumns } from "@/components/tables/PeopleColumns";
import { User } from "@prisma/client";

const People = () => {
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const { users, isLoading, deleteItem } = useUserQuery();
  const navigate = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleView = (id: string) => {
    navigate.push(`/people/view/${id}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteItem(id);
    },
    [deleteItem],
  );

  const onDelete = useCallback(
    (user: any) => {
      handleDelete(user.id!);
    },
    [handleDelete],
  );

  const onView = (user: any) => {
    handleView(user.id!);
  };

  const columns = useMemo(() => peopleColumns({ onView, onDelete }), [onView, onDelete]);

  const memoizedUsers = useMemo(() => users || [], [users]);

  const filteredData = useMemo(() => {
    if (!searchTerm?.trim()) return memoizedUsers;
    
    return memoizedUsers.filter((item: any) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string" || typeof val === "number") {
          return val.toString().toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      }),
    );
  }, [memoizedUsers, searchTerm]);

  const table = useReactTable({
    data: filteredData,
    columns: columns as any,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  const TopCards = () => {
    const cardData = [
      {
        title: "Total Employees",
        value: users.length,
        icon: <UserPlus className="h-4 w-4" />,
        subtitle: "3 new this month",
      },
      {
        title: "Departments",
        value: 5,
        icon: <Building2 className="h-4 w-4" />,
        subtitle: "Active departments",
      },
      {
        title: "Assigned Assets",
        value: 18,
        icon: <Laptop className="h-4 w-4" />,
        subtitle: "75% of total assets",
      },
    ];

    return <StatusCards cards={cardData} />;
  };

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
      <HeaderBox
        title="People"
        subtitle="Manage and track people"
        icon={<Users className="w-4 w-4" />}
      />
      {isLoading ? <StatusCardPlaceholder /> : <TopCards />}
      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title={"New User"}
        description={"Register a new user for your organization."}
        form={<UserForm />}
      />
      <div className="space-y-6">
        <section className="flex w-full flex-col gap-6">
          {isLoading ? null : (
            <TableHeader
              table={table}
              onSearch={(value) => {
                setSearchTerm(value);
              }}
              onAddNew={openDialog}
            />
          )}

          <DataTable columns={columns as any} data={filteredData} isLoading={isLoading} />
        </section>
      </div>
    </div>
  );
};
export default People;
