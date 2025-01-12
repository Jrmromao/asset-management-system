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
import { peopleColumns } from "@/components/tables/PeopleColumns";
import { TableHeader } from "@/components/tables/TableHeader";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { Building2, Laptop, UserPlus, Users } from "lucide-react";
import StatusCards from "@/components/StatusCards";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import { useUserQuery } from "@/hooks/queries/useUserQuery";
import { useRoleQuery } from "@/hooks/queries/useRoleQuery";

const People = () => {
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const { users, isLoading } = useUserQuery();
  const { roles } = useRoleQuery();
  const navigate = useRouter();
  const handleView = async (id: string) => {
    navigate.push(`/people/view/${id}`);
  };

  const handleFilter = () => {
    setFilterDialogOpen(true);
  };
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDelete = async (id: string) => {};
  const onDelete = useCallback((user: User) => handleDelete(user?.id!), []);
  const onView = useCallback((user: User) => handleView(user?.id!), []);
  const columns = useMemo(() => peopleColumns({ onDelete, onView }), []);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return users;

    return users?.filter((item: any) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string" || typeof val === "number") {
          return val
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        }
        return false;
      }),
    );
  }, [users, searchTerm]);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
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

  useEffect(() => {
    console.log(users);
  });

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
        icon={<Users className="w-4 h-4" />}
      />

      {/* Stats Section */}
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
          {isLoading ? (
            <>
              <TableHeaderSkeleton />
            </>
          ) : (
            <TableHeader
              onSearch={handleSearch}
              onFilter={handleFilter}
              onImport={() => {}}
              onCreateNew={openDialog}
            />
          )}

          <DataTable columns={columns} data={users} isLoading={isLoading} />
        </section>
      </div>
    </div>
  );
};
export default People;
