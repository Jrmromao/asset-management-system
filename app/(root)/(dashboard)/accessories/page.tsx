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
import HeaderBox from "@/components/HeaderBox";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";

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

  return (
    <div className="min-h-screen p-6 space-y-6 mt-5">
      <div className="transactions-header">
        <HeaderBox title="Accessories" subtext="Manage your accessories." />
      </div>

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
