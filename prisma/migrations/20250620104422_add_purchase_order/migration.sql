-- AlterTable
ALTER TABLE "License" ADD COLUMN     "manufacturerId" TEXT;

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "manufacturerId" TEXT;

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "supplierId" TEXT,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "documentUrl" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "manufacturerId" TEXT,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_companyId_idx" ON "PurchaseOrder"("companyId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
