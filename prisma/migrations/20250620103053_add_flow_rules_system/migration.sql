/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `dailyOperatingHours` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `datePurchased` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `energyRating` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `poNumber` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Category` table. All the data in the column will be lost.
  - The `status` column on the `Company` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `isAdctive` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `accessoryId` on the `UserItem` table. All the data in the column will be lost.
  - You are about to drop the column `assignedAt` on the `UserItem` table. All the data in the column will be lost.
  - You are about to drop the column `licenseId` on the `UserItem` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `UserItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `UserItem` table. All the data in the column will be lost.
  - You are about to drop the column `returnedAt` on the `UserItem` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `UserItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serialNumber]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[primaryContactEmail]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,companyId]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,itemId,itemType]` on the table `UserItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `purchaseDate` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Made the column `modelId` on table `Asset` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `primaryContactEmail` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `UserItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_assigneeId_fkey";

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_modelId_fkey";

-- DropForeignKey
ALTER TABLE "UserItem" DROP CONSTRAINT "UserItem_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserItem" DROP CONSTRAINT "UserItem_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "UserItem" DROP CONSTRAINT "UserItem_userId_fkey";

-- DropIndex
DROP INDEX "Asset_assigneeId_idx";

-- DropIndex
DROP INDEX "Asset_formTemplateId_idx";

-- DropIndex
DROP INDEX "Asset_licenseId_idx";

-- DropIndex
DROP INDEX "Asset_poNumber_companyId_key";

-- DropIndex
DROP INDEX "Asset_serialNumber_companyId_key";

-- DropIndex
DROP INDEX "Asset_statusLabelId_idx";

-- DropIndex
DROP INDEX "Asset_supplierId_idx";

-- DropIndex
DROP INDEX "Role_name_key";

-- DropIndex
DROP INDEX "UserItem_accessoryId_idx";

-- DropIndex
DROP INDEX "UserItem_licenseId_idx";

-- DropIndex
DROP INDEX "UserItem_userId_accessoryId_key";

-- DropIndex
DROP INDEX "UserItem_userId_licenseId_key";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "assigneeId",
DROP COLUMN "dailyOperatingHours",
DROP COLUMN "datePurchased",
DROP COLUMN "energyRating",
DROP COLUMN "material",
DROP COLUMN "poNumber",
DROP COLUMN "price",
DROP COLUMN "status",
DROP COLUMN "weight",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "assignedTo" TEXT,
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "currentValue" DECIMAL(65,30),
ADD COLUMN     "depreciationRate" DECIMAL(65,30),
ADD COLUMN     "lastMaintenance" TIMESTAMP(3),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "nextMaintenance" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "purchasePrice" DECIMAL(65,30),
ADD COLUMN     "reorderPoint" INTEGER,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "warrantyEndDate" TIMESTAMP(3),
ALTER COLUMN "modelId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "type",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "billingContactEmail" TEXT,
ADD COLUMN     "billingContactName" TEXT,
ADD COLUMN     "billingContactPhone" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "dataRetentionPolicy" TEXT,
ADD COLUMN     "disasterRecoveryPlan" TEXT,
ADD COLUMN     "gdprCompliant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "primaryContactEmail" TEXT,
ADD COLUMN     "primaryContactName" TEXT,
ADD COLUMN     "primaryContactPhone" TEXT,
ADD COLUMN     "securityContact" TEXT,
ADD COLUMN     "subdomain" TEXT,
ADD COLUMN     "supportContact" TEXT,
ADD COLUMN     "technicalContactEmail" TEXT,
ADD COLUMN     "technicalContactName" TEXT,
ADD COLUMN     "technicalContactPhone" TEXT,
ADD COLUMN     "website" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "isAdctive",
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "permissions" JSONB;

-- Backfill data for new NOT NULL columns
UPDATE "Asset" SET "purchaseDate" = CURRENT_TIMESTAMP WHERE "purchaseDate" IS NULL;
UPDATE "Company" SET "primaryContactEmail" = 'placeholder-' || id || '@example.com' WHERE "primaryContactEmail" IS NULL;
UPDATE "Role" SET "companyId" = (SELECT id FROM "Company" LIMIT 1) WHERE "companyId" IS NULL;


-- AlterTable - make columns NOT NULL after backfilling
ALTER TABLE "Asset" ALTER COLUMN "purchaseDate" SET NOT NULL;
ALTER TABLE "Company" ALTER COLUMN "primaryContactEmail" SET NOT NULL;
ALTER TABLE "Role" ALTER COLUMN "companyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserItem" DROP COLUMN "accessoryId",
DROP COLUMN "assignedAt",
DROP COLUMN "licenseId",
DROP COLUMN "notes",
DROP COLUMN "quantity",
DROP COLUMN "returnedAt",
DROP COLUMN "revokedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "FlowRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlowRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowCondition" (
    "id" TEXT NOT NULL,
    "flowRuleId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "logicalOperator" TEXT DEFAULT 'AND',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FlowCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowAction" (
    "id" TEXT NOT NULL,
    "flowRuleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FlowAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowExecution" (
    "id" TEXT NOT NULL,
    "flowRuleId" TEXT NOT NULL,
    "maintenanceId" TEXT,
    "assetId" TEXT,
    "trigger" TEXT NOT NULL,
    "context" JSONB NOT NULL,
    "results" JSONB NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,

    CONSTRAINT "FlowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlowRule_companyId_idx" ON "FlowRule"("companyId");

-- CreateIndex
CREATE INDEX "FlowRule_trigger_idx" ON "FlowRule"("trigger");

-- CreateIndex
CREATE INDEX "FlowRule_isActive_idx" ON "FlowRule"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FlowRule_name_companyId_key" ON "FlowRule"("name", "companyId");

-- CreateIndex
CREATE INDEX "FlowCondition_flowRuleId_idx" ON "FlowCondition"("flowRuleId");

-- CreateIndex
CREATE INDEX "FlowCondition_order_idx" ON "FlowCondition"("order");

-- CreateIndex
CREATE INDEX "FlowAction_flowRuleId_idx" ON "FlowAction"("flowRuleId");

-- CreateIndex
CREATE INDEX "FlowAction_order_idx" ON "FlowAction"("order");

-- CreateIndex
CREATE INDEX "FlowExecution_flowRuleId_idx" ON "FlowExecution"("flowRuleId");

-- CreateIndex
CREATE INDEX "FlowExecution_maintenanceId_idx" ON "FlowExecution"("maintenanceId");

-- CreateIndex
CREATE INDEX "FlowExecution_assetId_idx" ON "FlowExecution"("assetId");

-- CreateIndex
CREATE INDEX "FlowExecution_executedAt_idx" ON "FlowExecution"("executedAt");

-- CreateIndex
CREATE INDEX "FlowExecution_success_idx" ON "FlowExecution"("success");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_name_companyId_key" ON "Asset"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_primaryContactEmail_key" ON "Company"("primaryContactEmail");

-- CreateIndex
CREATE INDEX "Role_companyId_idx" ON "Role"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_companyId_key" ON "Role"("name", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserItem_userId_itemId_itemType_key" ON "UserItem"("userId", "itemId", "itemType");

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "license_to_user_item" FOREIGN KEY ("itemId") REFERENCES "License"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "accessory_to_user_item" FOREIGN KEY ("itemId") REFERENCES "Accessory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowRule" ADD CONSTRAINT "FlowRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowCondition" ADD CONSTRAINT "FlowCondition_flowRuleId_fkey" FOREIGN KEY ("flowRuleId") REFERENCES "FlowRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowAction" ADD CONSTRAINT "FlowAction_flowRuleId_fkey" FOREIGN KEY ("flowRuleId") REFERENCES "FlowRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowExecution" ADD CONSTRAINT "FlowExecution_flowRuleId_fkey" FOREIGN KEY ("flowRuleId") REFERENCES "FlowRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowExecution" ADD CONSTRAINT "FlowExecution_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowExecution" ADD CONSTRAINT "FlowExecution_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
