"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAccessoryStore } from "@/lib/stores/accessoryStore";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { accessoriesColumns } from "@/components/tables/AccessoriesColumns";
import { TableHeader } from "@/components/tables/TableHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { useDialogStore } from "@/lib/stores/store";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { BsDisplay } from "react-icons/bs";
import HeaderBox from "@/components/HeaderBox";
import StatusCards from "@/components/StatusCards";

const Accessories = () => {
  const [accessories, getAll, deleteAccessory, loading] = useAccessoryStore(
    (state) => [state.accessories, state.getAll, state.delete, state.loading],
  );

  const [filteredData, setFilteredData] = useState(accessories);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
    minQuantity: "",
  });

  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);

  const navigate = useRouter();

  useEffect(() => {
    getAll();
  }, [getAll]);

  useEffect(() => {
    setFilteredData(accessories);
  }, [accessories]);

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(accessories);
      return;
    }

    const searchResults = accessories.filter((item: any) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string" || typeof val === "number") {
          return val.toString().toLowerCase().includes(value.toLowerCase());
        }
        return false;
      }),
    );
    setFilteredData(searchResults);
  };

  const handleFilter = () => {
    setFilterDialogOpen(true);
  };

  const applyFilters = () => {
    let results = [...accessories];

    if (filters.supplier) {
      results = results.filter((item) =>
        item?.supplier?.name
          .toLowerCase()
          .includes(filters.supplier.toLowerCase()),
      );
    }

    if (filters.inventory) {
      results = results.filter((item) =>
        item.inventory?.name
          .toLowerCase()
          .includes(filters.inventory.toLowerCase()),
      );
    }

    setFilteredData(results);
    setFilterDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAccessory(id);
    getAll();
  };

  const handleView = (id: string) => {
    navigate.push(`/accessories/view/${id}`);
  };

  const onDelete = useCallback(
    (accessory: any) => handleDelete(accessory.id!),
    [handleDelete],
  );
  const onView = useCallback(
    (accessory: any) => handleView(accessory.id!),
    [handleView],
  );
  const columns = useMemo(
    () => accessoriesColumns({ onDelete, onView }),
    [onDelete, onView],
  );
  const availableAccessories = accessories.filter((acc) => {
    return acc.statusLabel?.name.toUpperCase() === "AVAILABLE";
  });

  const TopCards = () => {
    const cardData = [
      {
        title: "Total Accessories",
        value: accessories.length,
      },
      {
        title: "Available Accessories",
        value: availableAccessories.length,
        percentage: availableAccessories.length,
        total: accessories.length,
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
    <div className="min-h-screen p-6 space-y-6 mt-5">
      {/* Breadcrumb */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/accessories">Accessories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Section */}
      <HeaderBox
        title="Accessories"
        subtext="Manage and track your accessories"
        icon={<BsDisplay className="w-4 h-4" />}
      />
      {/* Stats Cards */}
      <TopCards />
      {loading ? (
        <TableHeaderSkeleton />
      ) : (
        <TableHeader
          onSearch={handleSearch}
          onFilter={handleFilter}
          onImport={() => openDialog()}
          onCreateNew={() => navigate.push("/accessories/create")}
        />
      )}

      <DataTable columns={columns} data={filteredData} isLoading={loading} />

      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Accessories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Supplier"
              value={filters.supplier}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, supplier: e.target.value }))
              }
            />
            <Input
              placeholder="Inventory"
              value={filters.inventory}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, inventory: e.target.value }))
              }
            />
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="Import Accessories"
        description="Import assets from a CSV file"
        form={<FileUploadForm dataType="accessories" />}
      />
    </div>
  );
};

export default Accessories;
