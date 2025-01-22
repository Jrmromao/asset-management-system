/*
  Warnings:

  - A unique constraint covering the columns `[poNumber,companyId]` on the table `Accessory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialNumber,companyId]` on the table `Accessory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialNumber,companyId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[poNumber,companyId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Accessory_poNumber_key";

-- DropIndex
DROP INDEX "Asset_poNumber_key";

-- DropIndex
DROP INDEX "Asset_serialNumber_key";

-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "serialNumber" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Accessory_poNumber_companyId_key" ON "Accessory"("poNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Accessory_serialNumber_companyId_key" ON "Accessory"("serialNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_companyId_key" ON "Asset"("serialNumber", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_poNumber_companyId_key" ON "Asset"("poNumber", "companyId");
