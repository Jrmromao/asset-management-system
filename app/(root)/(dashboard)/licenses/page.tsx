"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
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
import { TableHeader } from "@/components/tables/TableHeader";

const Licenses = () => {
  const navigate = useRouter();
  const [licenses, getAll, deleteLicense] = useLicenseStore((state) => [
    state.licenses,
    state.getAll,
    state.delete,
  ]);
  const [filteredData, setFilteredData] = useState(licenses);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });

  const handleFilter = () => {
    setFilterDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(licenses);
      return;
    }

    const searchResults = licenses.filter((item: any) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string" || typeof val === "number") {
          return val.toString().toLowerCase().includes(value.toLowerCase());
        }
        return false;
      }),
    );
    setFilteredData(searchResults);
  };

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

  useEffect(() => {
    setFilteredData(licenses);
  }, [licenses]);

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
        <section className="flex w-full flex-col gap-6">
          <TableHeader
            onSearch={handleSearch}
            onFilter={handleFilter}
            onImport={() => {}}
            onCreateNew={() => navigate.push("/licenses/create")}
          />
          <DataTable columns={columns} data={filteredData} />
        </section>
      </div>
    </div>
  );
};
export default Licenses;
