"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import FilterDialog from "@/components/dialogs/FilterDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Filter, Import, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeaderBox from "@/components/HeaderBox";

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
        toast.success("Asset has been deleted");
      })
      .catch((err) => {
        toast.error(err);
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

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const availableAssets = 23;
  const maintenanceDue = assets.filter((asset) => {
    const dueDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return dueDate <= thirtyDaysFromNow;
  }).length;

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

      {/* Header Section */}
      <HeaderBox
        title="Assets"
        subtext="Manage and track your assets"
        icon={<Calendar className="w-4 h-4" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableAssets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((availableAssets / assets.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maintenance Due
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {maintenanceDue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Due within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleFilter}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => openDialog()}
          >
            <Import className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => navigate.push("/assets/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
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
