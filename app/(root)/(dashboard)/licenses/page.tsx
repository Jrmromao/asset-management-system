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
import { FileCheck } from "lucide-react";
import StatusCards from "@/components/StatusCards";

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

  const availableLicenses = licenses.filter(
    (license) => license.statusLabel?.name.toUpperCase() === "AVAILABLE",
  );

  const TopCards = () => {
    const cardData = [
      {
        title: "Total Licenses",
        value: licenses.length,
      },
      {
        title: "Available Licenses",
        value: availableLicenses.length,
        percentage: availableLicenses.length,
        total: availableLicenses.length,
      },
      {
        title: "Maintenance Due",
        value: 3,
        subtitle: "Due within 30 days",
        color: "yellow",
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
      <TopCards />
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
