import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { X, Pencil } from "lucide-react";
import AssetForm from "../AssetForm";
import MainFormSkeleton from "../MainFormSkeleton";
import { toast } from "sonner";

interface EditAssetDrawerProps {
  assetId: string;
  open: boolean;
  onClose: () => void;
  assetName?: string;
  assetStatus?: string;
  assetStatusColor?: string;
}

const EditAssetDrawer: React.FC<EditAssetDrawerProps> = ({ assetId, open, onClose, assetName = "Asset", assetStatus = "Active", assetStatusColor = "#22C55E" }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Handler for AssetForm success
  const handleSuccess = () => {
    toast.success("Asset updated successfully!");
    onClose();
  };

  // Handler for AssetForm error
  const handleError = (err: string) => {
    setError(err);
    toast.error("Failed to update asset: " + err);
  };

  return (
    <Sheet open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
      <SheetContent
        side="right"
        className="w-[800px] sm:max-w-[800px] bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-2xl rounded-l-2xl flex flex-col animate-slide-in border-l-4 border-primary"
        hideDefaultClose
        aria-label="Edit Asset Drawer"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <SheetHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b pb-4 flex flex-row items-center justify-between rounded-t-2xl border-b-primary/30">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <Pencil className="h-6 w-6 text-primary" aria-label="Asset Icon" />
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold truncate max-w-[300px]" title={assetName}>{assetName}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: assetStatusColor, color: '#fff' }}>
                  {assetStatus}
                </span>
              </div>
              <SheetTitle className="text-xl font-semibold">Edit Asset</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Make changes to the asset details and save when you're done.
              </SheetDescription>
            </div>
          </div>
          <button
            aria-label="Close Drawer"
            className="p-2 rounded hover:bg-muted transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-full w-full space-y-8 flex-1">
          {loading ? (
            <MainFormSkeleton />
          ) : error ? (
            <div className="text-destructive text-center py-8">
              <p className="font-semibold">Failed to load asset.</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <AssetForm
              id={assetId}
              isUpdate={true}
            />
          )}
        </div>
        <div className="sticky bottom-0 left-0 w-full bg-white/90 backdrop-blur border-t flex justify-end gap-2 px-6 py-4 rounded-b-2xl shadow-md z-10">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditAssetDrawer; 