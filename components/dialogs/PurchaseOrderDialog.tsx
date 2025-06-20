"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePurchaseOrderUIStore } from "@/lib/stores/usePurchaseOrderUIStore";
import { PurchaseOrderForm } from "../forms/PurchaseOrderForm";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export function PurchaseOrderDialog() {
  const { isOpen, onClose } = usePurchaseOrderUIStore();
  const [companyId, setCompanyId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function getUserCompany() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.user_metadata?.companyId) {
        setCompanyId(user.user_metadata.companyId);
      }
    }
    if (isOpen) {
      getUserCompany();
    }
  }, [isOpen]);

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
