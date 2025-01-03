"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import HeaderBox from "@/components/HeaderBox";
import { useDialogStore } from "@/lib/stores/store";
import { useAssetStore } from "@/lib/stores/assetStore";
import { useRouter } from "next/navigation";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { assetColumns } from "@/components/tables/AssetColumns";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { TableHeader } from "@/components/tables/TableHeader";
import FilterDialog from "@/components/dialogs/FilterDialog";

const Assets = () => {
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);

  const [assets, loading, fetchAssets, getAssetById, deleteAsset] =
    useAssetStore((state) => [
      state.assets,
      state.loading,
      state.getAll,
      state.findById,
      state.delete,
    ]);

  const navigate = useRouter();

  const handleDelete = async (id: string) => {
    await deleteAsset(id)
      .then((_) => {
        fetchAssets();
        toast.success("Event has been created");
      })
      .catch((err) => {
        toast.error(err);
      });
  };

  useEffect(() => {
    setFilteredData(assets);
  }, [assets]);

  const handleFilter = () => {
    setFilterDialogOpen(true);
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setFilteredData(assets);
      return;
    }

    const searchResults = assets.filter((item: any) =>
      Object.entries(item).some(([key, val]) => {
        if (typeof val === "string" || typeof val === "number") {
          return val.toString().toLowerCase().includes(value.toLowerCase());
        }
        return false;
      }),
    );
    setFilteredData(searchResults);
  };
  const handleView = async (id: string) => {
    navigate.push(`/assets/view/${id}`);
  };

  const onDelete = useCallback(
    (asset: Asset) => asset?.id && handleDelete(asset.id),
    [],
  );

  const onView = useCallback(
    (asset: Asset) => asset?.id && handleView(asset.id),
    [],
  );
  const [filteredData, setFilteredData] = useState(assets);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });
  const applyFilters = () => {
    const results = [...assets];

    // if (filters.manufacturer) {
    //   results = results.filter((item) =>
    //     item?.model?.manufacturer?.name
    //       .toLowerCase()
    //       .includes(filters.supplier.toLowerCase()),
    //   );
    // }
    //
    // if (filters.inventory) {
    //   results = results.filter((item) =>
    //     item.inventory?.name
    //       .toLowerCase()
    //       .includes(filters.inventory.toLowerCase()),
    //   );
    // }

    setFilteredData(results);
    setFilterDialogOpen(false);
  };

  const columns = useMemo(() => assetColumns({ onDelete, onView }), []);

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <div className="assets">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/assets">Assets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
        title="Filter Assets"
      />
      <div className="transactions-header">
        <HeaderBox title="Assets" subtext="Manage your assets." />
      </div>
      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="Import Assets"
        description="Import assets from a CSV file"
        form={<FileUploadForm dataType="assets" />}
      />
      <div className="space-y-6">
        <section className="flex w-full flex-col gap-6">
          <TableHeader
            onSearch={handleSearch}
            onFilter={handleFilter}
            onImport={() => openDialog()}
            onCreateNew={() => navigate.push("/assets/create")}
          />
          <DataTable columns={columns} data={filteredData} />
        </section>
      </div>
    </div>
  );
};

export default Assets;
