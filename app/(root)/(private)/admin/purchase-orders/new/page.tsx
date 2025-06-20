import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";
import { createClient } from "@/utils/supabase/server";

export default async function NewPurchaseOrderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const companyId = user?.user_metadata?.companyId;

  if (!companyId) {
    return <div>Could not determine company to create purchase order for.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">New Purchase Order</h1>
      <PurchaseOrderForm companyId={companyId} />
    </div>
  );
}
