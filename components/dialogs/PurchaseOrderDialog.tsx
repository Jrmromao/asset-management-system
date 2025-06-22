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

export function PurchaseOrderDialog() {
  const { isOpen, onClose } = usePurchaseOrderUIStore();
  const { user } = useUser();
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isOpen && user) {
      // Access companyId from user's public metadata
      const metadata = user.publicMetadata as { companyId?: string };
      if (metadata?.companyId) {
        setCompanyId(metadata.companyId);
      }
    }
  }, [isOpen, user]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
        </DialogHeader>
        {companyId ? (
          <PurchaseOrderForm companyId={companyId} />
        ) : (
          <div>Loading user information...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
