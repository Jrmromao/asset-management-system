/*
  Warnings:

  - A unique constraint covering the columns `[poNumber]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "poNumber" TEXT,
ADD COLUMN     "price" DECIMAL(65,30);

-- CreateIndex
CREATE UNIQUE INDEX "Asset_poNumber_key" ON "Asset"("poNumber");

-- CreateIndex
CREATE INDEX "Asset_licenseId_idx" ON "Asset"("licenseId");
