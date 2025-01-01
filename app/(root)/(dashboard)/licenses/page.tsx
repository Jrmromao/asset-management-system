"use client";
import React, { useCallback, useEffect, useMemo } from "react";
import HeaderBox from "@/components/HeaderBox";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLicenseStore } from "@/lib/stores/licenseStore";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { licenseColumns } from "@/components/tables/LicensesColumns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

const Licenses = () => {
  const navigate = useRouter();
  const [licenses, getAll, deleteLicense] = useLicenseStore((state) => [
    state.licenses,
    state.getAll,
    state.delete,
  ]);
  const handleDelete = async (id: string) => {
    await deleteLicense(id).then((_) => {
      getAll();
    });
  };
  const handleView = async (id: string) => {
    navigate.push(`/licenses/view/${id}`);
  };
  const onDelete = useCallback(
    (accessory: any) => handleDelete(accessory?.id!),
    [],
  );
  const onView = useCallback(
    (accessory: any) => handleView(accessory?.id!),
    [],
  );
  const columns = useMemo(() => licenseColumns({ onDelete, onView }), []);

  useEffect(() => {
    getAll();
  }, []);

  return (
    <div className="assets">
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
      <div className="transactions-header">
        <HeaderBox title="Licenses" subtext="Manage your licenses." />
      </div>
      <div className="space-y-6">
        <section className="flex">
          <div className="flex justify-end">
            <Button
              variant={"link"}
              onClick={() => navigate.push("/licenses/create")}
            >
              Add License
            </Button>
            <Button
              variant={"link"}
              onClick={() => navigate.push("/licenses/export")}
            >
              Export
            </Button>
            <Button
              variant={"link"}
              className={"flex justify-end"}
              onClick={() => navigate.push("/licenses/export")}
            >
              Import
            </Button>
          </div>
        </section>
        <section className="flex w-full flex-col gap-6">
          <DataTable columns={columns} data={licenses} />
        </section>
      </div>
    </div>
  );
};
export default Licenses;
