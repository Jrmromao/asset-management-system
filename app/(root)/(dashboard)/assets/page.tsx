"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDialogStore } from "@/lib/stores/store";
import { useRouter } from "next/navigation";
import { assetColumns } from "@/components/tables/AssetColumns";
import { toast } from "sonner";
import StatusCards from "@/components/StatusCards";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import HeaderBox from "@/components/HeaderBox";
import { Calendar } from "lucide-react";
import StatusCardPlaceholder from "@/components/StatusCardPlaceholder";
import TableHeaderSkeleton from "@/components/tables/TableHeaderSkeleton";
import { TableHeader } from "@/components/tables/TableHeader";
import FilterDialog from "@/components/dialogs/FilterDialog";
import { DialogContainer } from "@/components/dialogs/DialogContainer";
import FileUploadForm from "@/components/forms/FileUploadForm";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/tables/DataTable/data-table";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";

const Assets = () => {
  const { isLoading, assets, deleteItem } = useAssetQuery();

  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);

  // const [assets, loading, fetchAssets, getAssetById, deleteAsset] =
  //   useAssetStore((state) => [
  //     state.assets,
  //     state.loading,
  //     state.getAll,
  //     state.findById,
  //     state.delete,
  //   ]);

  const navigate = useRouter();

  const handleDelete = async (id: string) => {
    await deleteItem(id, {
      onSuccess: () => {
        toast.success("Asset deleted successfully");
      },
      onError: () => {
        toast.error("Failed to delete asset");
      },
    });
  };

  const [filteredData, setFilteredData] = useState(assets);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });

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
    [handleDelete],
  );

  const onView = useCallback(
    (asset: Asset) => asset?.id && handleView(asset.id),
    [handleView],
  );

  const applyFilters = () => {
    const results = [...assets];
    setFilteredData(results);
    setFilterDialogOpen(false);
  };

  const columns = useMemo(
    () => assetColumns({ onDelete, onView }),
    [onDelete, onView],
  );

  const availableAssets = assets.filter((asset) => {
    return asset.statusLabel?.name.toUpperCase() === "AVAILABLE";
  });
  const maintenanceDue = assets.filter((asset) => {
    const dueDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return dueDate <= thirtyDaysFromNow;
  }).length;

  const TopCards = () => {
    const cardData = [
      {
        title: "Total Assets",
        value: assets.length,
      },
      {
        title: "Available Assets",
        value: availableAssets.length,
        percentage: availableAssets.length,
        total: assets.length,
      },
      {
        title: "Maintenance Due",
        value: maintenanceDue,
        subtitle: "Due within 30 days",
        color: "yellow",
      },
    ];

    return <StatusCards cards={cardData} />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
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

      {/*/!* Header Section *!/*/}
      <HeaderBox
        title="Assets"
        subtext="Manage and track your assets"
        icon={<Calendar className="w-4 h-4" />}
      />

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
            onImport={() => openDialog()}
            onCreateNew={() => navigate.push("/assets/create")}
          />
        </>
      )}

      {/*/!* Table *!/*/}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/*/!* Dialogs *!/*/}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={applyFilters}
        title="Filter Assets"
      />
      <DialogContainer
        open={isOpen}
        onOpenChange={closeDialog}
        title="Import Assets"
        description="Import assets from a CSV file"
        form={<FileUploadForm dataType="assets" />}
      />
    </div>
  );
};

export default Assets;
