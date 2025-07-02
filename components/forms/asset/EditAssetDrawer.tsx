import React, { useState, useEffect } from "react";
import EntityEditDrawer from "@/components/shared/EntityEditDrawer";
import { Pencil } from "lucide-react";
import AssetForm from "../AssetForm";
import MainFormSkeleton from "../MainFormSkeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";

interface EditAssetDrawerProps {
  assetId: string;
  open: boolean;
  onClose: () => void;
  assetName?: string;
  assetStatus?: string;
  assetStatusColor?: string;
}

const EditAssetDrawer: React.FC<EditAssetDrawerProps> = ({
  assetId,
  open,
  onClose,
  assetName = "Asset",
  assetStatus = "Active",
  assetStatusColor = "#22C55E",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();
  const { findItemById } = useAssetQuery()();
  const [asset, setAsset] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    findItemById(assetId)
      .then((result: any) => {
        if (result) {
          setAsset(result);
        } else {
          setError("Failed to load asset");
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Failed to load asset");
      })
      .finally(() => setLoading(false));
  }, [assetId, open, findItemById]);

  // Handler for AssetForm success
  const handleSuccess = () => {
    toast.success("Asset updated successfully!");
    queryClient.invalidateQueries({ queryKey: ["asset", assetId] });
    onClose();
  };

  // Handler for AssetForm error
  const handleError = (err: string) => {
    setError(err);
    toast.error("Failed to update asset: " + err);
  };

  // Use asset statusLabel if available
  const statusLabel = asset?.statusLabel?.name || assetStatus;
  const statusColor = asset?.statusLabel?.colorCode || assetStatusColor;

  return (
    <EntityEditDrawer
      open={open}
      onClose={onClose}
      title="Edit Asset"
      description="Make changes to the asset details and save when you're done."
      statusLabel={statusLabel}
      statusColor={statusColor}
      icon={<Pencil className="h-6 w-6 text-primary" aria-label="Asset Icon" />}
      footer={
        <>
          <button
            className="btn btn-outline px-4 py-2 rounded font-medium"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary px-4 py-2 rounded font-medium"
            form="asset-form"
            type="submit"
          >
            Save
          </button>
        </>
      }
    >
      {loading ? (
        <MainFormSkeleton />
      ) : error ? (
        <div className="text-destructive text-center py-8">
          <p className="font-semibold">Failed to load asset.</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <AssetForm id={assetId} isUpdate={true} onSuccess={handleSuccess} />
      )}
    </EntityEditDrawer>
  );
};

export default EditAssetDrawer;
