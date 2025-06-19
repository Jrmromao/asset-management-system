"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDialogStore } from "@/lib/stores/store";
import { useRouter } from "next/navigation";
import { assetColumns } from "@/components/tables/AssetColumns";
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
import { toast } from "sonner";

const Assets = () => {
  const { isLoading, assets, deleteItem } = useAssetQuery();
  const [openDialog, closeDialog, isOpen] = useDialogStore((state) => [
    state.onOpen,
    state.onClose,
    state.isOpen,
  ]);
  const navigate = useRouter();

  const [filteredData, setFilteredData] = useState<Asset[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    supplier: "",
    inventory: "",
  });

  useEffect(() => {
    if (assets.length > 0) {
      const activeAssets = assets.filter(
        (asset) => asset.status !== "Inactive",
      );
      setFilteredData(activeAssets);
    }
  }, [assets]);

  const handleFilter = useCallback(() => {
    setFilterDialogOpen(true);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      if (!value.trim()) {
        const activeAssets = assets.filter(
          (asset) => asset.status !== "Inactive",
        );
        setFilteredData(activeAssets);
        return;
      }

      const searchResults = assets.filter(
        (item) =>
          item.status !== "Inactive" &&
          Object.entries(item).some(([key, val]) => {
            if (typeof val === "string" || typeof val === "number") {
              return val.toString().toLowerCase().includes(value.toLowerCase());
            }
            return false;
          }),
      );
      setFilteredData(searchResults);
    },
    [assets],
  );

  const handleView = useCallback(
    async (id: string) => {
      navigate.push(`/assets/view/${id}`);
    },
    [navigate],
  );

  const onDelete = useCallback(
    (asset: Asset) => asset?.id && deleteItem(asset.id),
    [deleteItem],
  );

  const onView = useCallback(
    (asset: Asset) => asset?.id && handleView(asset.id),
    [handleView],
  );

  const applyFilters = useCallback(() => {
    const results = assets
      .filter((asset) => asset.status !== "Inactive")
      .filter((asset) => {
        // Your other filter conditions here
        return true; // modify based on your filters object
      });
    setFilteredData(results);
    setFilterDialogOpen(false);
  }, [assets]);

  const columns = useMemo(
    () => assetColumns({ onDelete, onView }),
    [onDelete, onView],
  );

  const availableAssets = useMemo(
    () =>
      assets.filter(
        (asset) => asset.statusLabel?.name.toUpperCase() === "AVAILABLE",
      ),
    [assets],
  );

  const maintenanceDue = useMemo(
    () =>
      assets.filter((asset) => {
        const dueDate = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return dueDate <= thirtyDaysFromNow;
      }).length,
    [assets],
  );

  const TopCards = useCallback(() => {
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
  }, [assets.length, availableAssets.length, maintenanceDue]);

  const handleExport = useCallback(async () => {
    try {
      const response = await fetch('/api/assets/export', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to export assets');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting assets:', error);
      toast.error('Failed to export assets');
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
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
            onExport={handleExport}
            onCreateNew={() => navigate.push("/assets/create")}
          />
        </>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

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
