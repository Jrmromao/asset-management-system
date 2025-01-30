/*
  Warnings:

  - You are about to drop the column `assetLimit` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `UsageRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billingPeriod` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCycleAnchor` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualAssetCount` to the `UsageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingPeriodEnd` to the `UsageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingPeriodStart` to the `UsageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerAsset` to the `UsageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasedAssetQuota` to the `UsageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `UsageRecord` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "billingPeriod" JSONB NOT NULL,
ADD COLUMN     "items" JSONB NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "assetLimit",
ADD COLUMN     "billingCycleAnchor" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "trialEndsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UsageRecord" DROP COLUMN "quantity",
ADD COLUMN     "actualAssetCount" INTEGER NOT NULL,
ADD COLUMN     "billingPeriodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "billingPeriodStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pricePerAsset" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "purchasedAssetQuota" INTEGER NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "BillingSettings" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "paymentMethodId" TEXT,
    "billingEmail" TEXT NOT NULL,
    "taxId" TEXT,
    "billingAddressLine1" TEXT,
    "billingAddressLine2" TEXT,
    "billingCity" TEXT,
    "billingState" TEXT,
    "billingZip" TEXT,
    "billingCountry" TEXT,

    CONSTRAINT "BillingSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingSettings_subscriptionId_key" ON "BillingSettings"("subscriptionId");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_companyId_key" ON "Subscription"("companyId");

-- CreateIndex
CREATE INDEX "UsageRecord_timestamp_idx" ON "UsageRecord"("timestamp");

-- AddForeignKey
ALTER TABLE "BillingSettings" ADD CONSTRAINT "BillingSettings_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
