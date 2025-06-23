import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";
import { currentUser } from "@clerk/nextjs/server";

export default async function NewPurchaseOrderPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Please sign in to create purchase orders.</div>;
  }

  const companyId = user.privateMetadata?.companyId as string;

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
