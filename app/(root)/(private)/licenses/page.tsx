"use client";
import React, { useCallback, useMemo, useState, useEffect } from "react";
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
import TableHeader from "@/components/tables/TableHeader";
import { FileCheck } from "lucide-react";
import StatusCards from "@/components/StatusCards";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

const Licenses = () => {
  const { licenses, isLoading, deleteItem } = useLicenseQuery();
  const [filteredData, setFilteredData] = useState(licenses);

  const navigate = useRouter();

  useEffect(() => {
    setFilteredData(licenses);
  }, [licenses]);

  const handleSearch = (value: string) => {
    const searchResults = licenses.filter((item: any) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(value.toLowerCase()),
      ),
    );
    setFilteredData(searchResults);
  };

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteItem(id);
    },
    [deleteItem],
  );

  const handleView = useCallback(
    (id: string) => {
      navigate.push(`/licenses/view/${id}`);
    },
    [navigate],
  );

  const onDelete = useCallback(
    (license: any) => {
      handleDelete(license.id!);
    },
    [handleDelete],
  );

  const onView = useCallback(
    (license: any) => {
      handleView(license.id!);
    },
    [handleView],
  );

  const columns = useMemo(
    () => licenseColumns({ onDelete, onView }),
    [onDelete, onView],
  );
  const availableLicenses = licenses.filter(
    (license) => license.statusLabel?.name.toLowerCase() === "available",
  );

  const memoizedFilteredData = useMemo(() => filteredData, [filteredData]);

  const table = useReactTable({
    data: memoizedFilteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const TopCards = useMemo(() => {
    const cardData = [
      {
        title: "Total Licenses",
        value: licenses.length,
        icon: <FileCheck />,
      },
      {
        title: "Available Licenses",
        value: availableLicenses.length,
        icon: <FileCheck />,
        percentage: licenses.length > 0 ? (availableLicenses.length / licenses.length) * 100 : 0,
        total: licenses.length,
      },
    ];
    return <StatusCards cards={cardData} />;
  }, [licenses.length, availableLicenses.length]);

  return (
    <div className="min-h-screen p-6 space-y-6 mt-5">
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
        icon={<FileCheck />}
        title="Licenses"
        subtitle="Manage all your software licenses"
      />
      {isLoading ? (
        <>
          <StatusCardPlaceholder />
          <TableHeader table={table} />
        </>
      ) : (
        <>
          {TopCards}
          <TableHeader
            table={table}
            onSearch={handleSearch}
            onFilter={() => {}}
            onImport={() => {}}
            onAddNew={() => navigate.push("/licenses/create")}
          />
        </>
      )}
      <DataTable columns={columns} data={filteredData} isLoading={isLoading} />
    </div>
  );
};

export default Licenses;
