"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrderUIStore } from "@/lib/stores/usePurchaseOrderUIStore";
import { PurchaseOrderForm } from "../forms/PurchaseOrderForm";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useUserMetadataSync } from "@/hooks/useUserMetadataSync";
import { Button } from "../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

export function PurchaseOrderDialog() {
  const { isOpen, onClose } = usePurchaseOrderUIStore();
  const { user } = useUser();
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);
  const { syncUserMetadata, isLoading: isSyncing } = useUserMetadataSync();
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Access companyId from user's public metadata
      const metadata = user.publicMetadata as { companyId?: string };
      if (metadata?.companyId) {
        setCompanyId(metadata.companyId);
      } else if (!syncAttempted) {
        // If no companyId is found, try to sync metadata
        handleSyncMetadata();
      }
    }
  }, [isOpen, user, syncAttempted]);

  const handleSyncMetadata = async () => {
    setSyncAttempted(true);
    const result = await syncUserMetadata();
    if (result.success && result.companyId) {
      setCompanyId(result.companyId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>
        {companyId ? (
          <PurchaseOrderForm companyId={companyId} fromAssetForm={true} />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <div>Loading user information...</div>
            {syncAttempted && (
              <Button onClick={handleSyncMetadata} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync User Data"
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
