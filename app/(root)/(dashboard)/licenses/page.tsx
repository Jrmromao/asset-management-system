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
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { FileCheck } from "lucide-react";

const Licenses = () => {
  const navigate = useRouter();
  const [licenses, getAll, deleteLicense, loading] = useLicenseStore(
    (state) => [state.licenses, state.getAll, state.delete, state.loading],
  );
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
    <div className="p-6 space-y-6">
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
        subtext="Manage your licenses."
        icon={<FileCheck className="w-4 h-4" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Licenses</p>
              <p className="text-3xl font-bold">12</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Active Licenses</p>
              <p className="text-3xl font-bold">10</p>
              <p className="text-sm text-gray-500">83.3% of total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Renewals Due</p>
              <p className="text-3xl font-bold text-amber-500">2</p>
              <p className="text-sm text-gray-500">Due within 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <section className="flex w-full flex-col gap-6">
          {loading ? (
            <TableHeaderSkeleton />
          ) : (
            <TableHeader
              onSearch={handleSearch}
              onFilter={handleFilter}
              onImport={() => {}}
              onCreateNew={() => navigate.push("/licenses/create")}
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
export default Licenses;
