-- AlterTable
ALTER TABLE "Co2eRecord" ADD COLUMN     "maintenanceId" TEXT;

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "statusLabelId" TEXT NOT NULL,
    "technicianId" TEXT,
    "supplierId" TEXT,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "completionDate" TIMESTAMP(3),
    "cost" DECIMAL(10,2),
    "isWarranty" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Maintenance_assetId_idx" ON "Maintenance"("assetId");

-- CreateIndex
CREATE INDEX "Maintenance_statusLabelId_idx" ON "Maintenance"("statusLabelId");

-- CreateIndex
CREATE INDEX "Maintenance_technicianId_idx" ON "Maintenance"("technicianId");

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_statusLabelId_fkey" FOREIGN KEY ("statusLabelId") REFERENCES "StatusLabel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
