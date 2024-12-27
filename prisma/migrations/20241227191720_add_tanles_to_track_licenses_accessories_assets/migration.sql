/*
  Warnings:

  - Added the required column `seatsAssigned` to the `UserLicense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserLicense" ADD COLUMN     "seatsAssigned" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "AccessoryStock" (
    "id" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "AccessoryStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseSeat" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "LicenseSeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetHistory" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "AssetHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccessoryStock_accessoryId_idx" ON "AccessoryStock"("accessoryId");

-- CreateIndex
CREATE INDEX "AccessoryStock_companyId_idx" ON "AccessoryStock"("companyId");

-- CreateIndex
CREATE INDEX "LicenseSeat_licenseId_idx" ON "LicenseSeat"("licenseId");

-- CreateIndex
CREATE INDEX "LicenseSeat_companyId_idx" ON "LicenseSeat"("companyId");

-- CreateIndex
CREATE INDEX "AssetHistory_assetId_idx" ON "AssetHistory"("assetId");

-- CreateIndex
CREATE INDEX "AssetHistory_companyId_idx" ON "AssetHistory"("companyId");

-- AddForeignKey
ALTER TABLE "AccessoryStock" ADD CONSTRAINT "AccessoryStock_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessoryStock" ADD CONSTRAINT "AccessoryStock_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseSeat" ADD CONSTRAINT "LicenseSeat_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseSeat" ADD CONSTRAINT "LicenseSeat_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetHistory" ADD CONSTRAINT "AssetHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
