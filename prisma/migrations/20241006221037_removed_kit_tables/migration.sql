/*
  Warnings:

  - You are about to drop the column `brand` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Co2eRecord` table. All the data in the column will be lost.
  - You are about to drop the `Kit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KitItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endOfLife` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endOfLife` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `material` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessoryId` to the `Co2eRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Co2eRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Accessory" DROP CONSTRAINT "Accessory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Kit" DROP CONSTRAINT "Kit_companyId_fkey";

-- DropForeignKey
ALTER TABLE "KitItem" DROP CONSTRAINT "KitItem_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "KitItem" DROP CONSTRAINT "KitItem_assetId_fkey";

-- DropForeignKey
ALTER TABLE "KitItem" DROP CONSTRAINT "KitItem_kitAccessory_fkey";

-- DropForeignKey
ALTER TABLE "KitItem" DROP CONSTRAINT "KitItem_kitAsset_fkey";

-- DropForeignKey
ALTER TABLE "KitItem" DROP CONSTRAINT "KitItem_kitLicense_fkey";

-- DropForeignKey
ALTER TABLE "KitItem" DROP CONSTRAINT "KitItem_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "UserKit" DROP CONSTRAINT "UserKit_kitId_fkey";

-- DropForeignKey
ALTER TABLE "UserKit" DROP CONSTRAINT "UserKit_userId_fkey";

-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "endOfLife" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "material" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "brand",
DROP COLUMN "categoryId",
DROP COLUMN "model",
DROP COLUMN "price",
ADD COLUMN     "endOfLife" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "material" TEXT NOT NULL,
ADD COLUMN     "modelId" TEXT,
ADD COLUMN     "supplierId" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Co2eRecord" DROP COLUMN "date",
ADD COLUMN     "accessoryId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Kit";

-- DropTable
DROP TABLE "KitItem";

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "supportUrl" TEXT NOT NULL,
    "supportPhone" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelNo" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "manufacturerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "locName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNum" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_supportUrl_key" ON "Manufacturer"("supportUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_supportPhone_key" ON "Manufacturer"("supportPhone");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_supportEmail_key" ON "Manufacturer"("supportEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Location_locName_key" ON "Location"("locName");

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;
