import React, { useState, useEffect } from "react";
import EntityEditDrawer from "@/components/shared/EntityEditDrawer";
import { Pencil } from "lucide-react";
import LicenseForm from "../LicenseForm";
import MainFormSkeleton from "../MainFormSkeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";

interface EditLicenseDrawerProps {
  licenseId: string;
  open: boolean;
  onClose: () => void;
  licenseName?: string;
  licenseStatus?: string;
  licenseStatusColor?: string;
}

const EditLicenseDrawer: React.FC<EditLicenseDrawerProps> = ({
  licenseId,
  open,
  onClose,
  licenseName = "License",
  licenseStatus = "Active",
  licenseStatusColor = "#22C55E",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { licenses = [], isLoading } = useLicenseQuery();
  const [license, setLicense] = useState<any>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    const found = licenses.find((l: any) => l.id === licenseId);
    if (found) {
      setLicense(found);
      setLoading(false);
    } else if (!isLoading) {
      setError("Failed to load license");
      setLoading(false);
    }
  }, [licenseId, open, licenses, isLoading]);

  // Handler for LicenseForm success
  const handleSuccess = () => {
    toast.success("License updated successfully!");
    queryClient.invalidateQueries({ queryKey: ["license", licenseId] });
    onClose();
  };

  // Handler for LicenseForm error
  const handleError = (err: string) => {
    setError(err);
    toast.error("Failed to update license: " + err);
  };

  // Use license statusLabel if available
  const statusLabel = license?.statusLabel?.name || licenseStatus;
  const statusColor = license?.statusLabel?.colorCode || licenseStatusColor;

  return (
    <EntityEditDrawer
      open={open}
      onClose={onClose}
      title="Edit License"
      description="Make changes to the license details and save when you're done."
      statusLabel={statusLabel}
      statusColor={statusColor}
      icon={
        <Pencil className="h-6 w-6 text-primary" aria-label="License Icon" />
      }
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
            form="license-form"
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
          <p className="font-semibold">Failed to load license.</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <LicenseForm id={licenseId} isUpdate={true} onSuccess={handleSuccess} />
      )}
    </EntityEditDrawer>
  );
};

export default EditLicenseDrawer;
