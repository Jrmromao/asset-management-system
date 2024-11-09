/*
  Warnings:

  - You are about to drop the column `locName` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Supplier` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `Images` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `StatusLable` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,companyId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[licenseKey]` on the table `License` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[modelNo,companyId]` on the table `Model` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Waitlist` will be added. If there are existing duplicate values, this will fail.
  - Made the column `companyId` on table `Accessory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `Category` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `Department` required. This step will fail if there are existing NULL values in that column.
  - Made the column `companyId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vendor` on table `License` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `name` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Manufacturer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Accessory" DROP CONSTRAINT "Accessory_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_statusLabelId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_companyId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Department" DROP CONSTRAINT "Department_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_companyId_fkey";

-- DropForeignKey
ALTER TABLE "StatusLable" DROP CONSTRAINT "StatusLable_companyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- DropIndex
DROP INDEX "License_name_key";

-- DropIndex
DROP INDEX "Location_locName_key";

-- DropIndex
DROP INDEX "Manufacturer_supportEmail_key";

-- DropIndex
DROP INDEX "Manufacturer_supportPhone_key";

-- AlterTable
ALTER TABLE "Accessory" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "License" ALTER COLUMN "vendor" SET NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "locName",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "addressLine2" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN     "companyId" TEXT NOT NULL,
ALTER COLUMN "supportPhone" DROP NOT NULL,
ALTER COLUMN "supportEmail" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "companyId" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "phone",
ALTER COLUMN "addressLine2" DROP NOT NULL,
ALTER COLUMN "phoneNum" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "notes" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "assetId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Images",
ADD COLUMN     "images" TEXT;

-- DropTable
DROP TABLE "StatusLable";

-- CreateTable
CREATE TABLE "StatusLabel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorCode" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "allowLoan" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StatusLabel_companyId_idx" ON "StatusLabel"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "StatusLabel_name_companyId_key" ON "StatusLabel"("name", "companyId");

-- CreateIndex
CREATE INDEX "Kit_companyId_idx" ON "Kit"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Kit_name_companyId_key" ON "Kit"("name", "companyId");

-- CreateIndex
CREATE INDEX "Accessory_companyId_idx" ON "Accessory"("companyId");

-- CreateIndex
CREATE INDEX "Accessory_categoryId_idx" ON "Accessory"("categoryId");

-- CreateIndex
CREATE INDEX "Asset_assigneeId_idx" ON "Asset"("assigneeId");

-- CreateIndex
CREATE INDEX "Asset_companyId_idx" ON "Asset"("companyId");

-- CreateIndex
CREATE INDEX "Asset_licenseId_idx" ON "Asset"("licenseId");

-- CreateIndex
CREATE INDEX "Asset_statusLabelId_idx" ON "Asset"("statusLabelId");

-- CreateIndex
CREATE INDEX "Asset_supplierId_idx" ON "Asset"("supplierId");

-- CreateIndex
CREATE INDEX "Asset_modelId_idx" ON "Asset"("modelId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_companyId_idx" ON "AuditLog"("companyId");

-- CreateIndex
CREATE INDEX "Category_companyId_idx" ON "Category"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_companyId_key" ON "Category"("name", "companyId");

-- CreateIndex
CREATE INDEX "Co2eRecord_assetId_idx" ON "Co2eRecord"("assetId");

-- CreateIndex
CREATE INDEX "Co2eRecord_accessoryId_idx" ON "Co2eRecord"("accessoryId");

-- CreateIndex
CREATE INDEX "Co2eRecord_userId_idx" ON "Co2eRecord"("userId");

-- CreateIndex
CREATE INDEX "Department_companyId_idx" ON "Department"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_companyId_key" ON "Department"("name", "companyId");

-- CreateIndex
CREATE INDEX "Inventory_companyId_idx" ON "Inventory"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_name_companyId_key" ON "Inventory"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseKey_key" ON "License"("licenseKey");

-- CreateIndex
CREATE INDEX "Location_companyId_idx" ON "Location"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_companyId_key" ON "Location"("name", "companyId");

-- CreateIndex
CREATE INDEX "Manufacturer_companyId_idx" ON "Manufacturer"("companyId");

-- CreateIndex
CREATE INDEX "Model_categoryId_idx" ON "Model"("categoryId");

-- CreateIndex
CREATE INDEX "Model_manufacturerId_idx" ON "Model"("manufacturerId");

-- CreateIndex
CREATE INDEX "Model_companyId_idx" ON "Model"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Model_modelNo_companyId_key" ON "Model"("modelNo", "companyId");

-- CreateIndex
CREATE INDEX "Role_companyId_idx" ON "Role"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_email_key" ON "Supplier"("email");

-- CreateIndex
CREATE INDEX "Transaction_assetId_idx" ON "Transaction"("assetId");

-- CreateIndex
CREATE INDEX "User_companyId_idx" ON "User"("companyId");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "UserKit_userId_idx" ON "UserKit"("userId");

-- CreateIndex
CREATE INDEX "UserKit_kitId_idx" ON "UserKit"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manufacturer" ADD CONSTRAINT "Manufacturer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_statusLabelId_fkey" FOREIGN KEY ("statusLabelId") REFERENCES "StatusLabel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLabel" ADD CONSTRAINT "StatusLabel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kit" ADD CONSTRAINT "Kit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKit" ADD CONSTRAINT "UserKit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKit" ADD CONSTRAINT "UserKit_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
