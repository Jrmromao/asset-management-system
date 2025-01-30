"use client";
import React, { useCallback, useMemo, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useRouter } from "next/navigation";
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
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";

const Licenses = () => {
  const navigate = useRouter();
  const { licenses, isLoading, deleteItem } = useLicenseQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });

  // Memoize filtered data instead of using state
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return licenses;
    }

    return licenses.filter((item: any) =>
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
  }, [licenses, searchTerm]);

  const handleFilter = () => {
    setFilterDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
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

  const columns = useMemo(
    () => licenseColumns({ onDelete, onView }),
    [onDelete, onView],
  );

  // Memoize available licenses calculation
  const availableLicenses = useMemo(
    () =>
      licenses.filter(
        (license) => license.statusLabel?.name.toUpperCase() === "AVAILABLE",
      ),
    [licenses],
  );

  const TopCards = useCallback(() => {
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
    ];

    return <StatusCards cards={cardData} />;
  }, [licenses.length, availableLicenses.length]);

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
      <div className="space-y-6">
        <section className="flex w-full flex-col gap-6">
          {isLoading ? (
            <>
              <StatusCardPlaceholder />
              <TableHeaderSkeleton />
            </>
          ) : (
            <>
              <TopCards />
              <TableHeader
                onSearch={handleSearch}
                onFilter={handleFilter}
                onImport={() => {}}
                onCreateNew={() => navigate.push("/licenses/create")}
              />
            </>
          )}
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
          />
        </section>
      </div>
    </div>
  );
};

export default Licenses;
