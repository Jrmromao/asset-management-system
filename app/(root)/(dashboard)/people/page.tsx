"use client";
import React, { useCallback, useEffect, useMemo } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useDialogStore } from "@/lib/stores/store";
import { Button } from "@/components/ui/button";
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
import { assetColumns } from "@/components/tables/AssetColumns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { peopleColumns } from "@/components/tables/PeopleColumns";

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

  const handleDelete = async (id: string) => {};
  const onDelete = useCallback((user: User) => handleDelete(user?.id!), []);
  const onView = useCallback((user: User) => handleView(user?.id!), []);
  const columns = useMemo(() => peopleColumns({ onDelete, onView }), []);

  useEffect(() => {
    useUserStore.getState().getAll();
    fetchRoles();
  }, []);
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
        <section className="flex">
          <div className="flex justify-end">
            <Button variant={"link"} onClick={openDialog}>
              Add People
            </Button>
          </div>
        </section>
        <section className="flex w-full flex-col gap-6">
          <DataTable columns={columns} data={users} />
        </section>
      </div>
    </div>
  );
};
export default People;
