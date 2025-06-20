-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "purchaseOrderId" TEXT;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
