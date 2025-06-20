/*
  Warnings:

  - You are about to drop the column `metadata` on the `PricingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `trialDays` on the `PricingPlan` table. All the data in the column will be lost.
  - You are about to alter the column `pricePerAsset` on the `PricingPlan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,4)`.
  - You are about to drop the column `billingCycleAnchor` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodStart` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerAsset` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `PlanLimit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `billingCycle` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assetQuota` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCycle` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlanLimit" DROP CONSTRAINT "PlanLimit_planId_fkey";

-- DropIndex
DROP INDEX "PricingPlan_stripePriceId_idx";

-- AlterTable
ALTER TABLE "PricingPlan" DROP COLUMN "metadata",
DROP COLUMN "trialDays",
ADD COLUMN     "billingCycle" TEXT NOT NULL,
ALTER COLUMN "pricePerAsset" SET DATA TYPE DECIMAL(10,4);

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "billingCycleAnchor",
DROP COLUMN "currentPeriodEnd",
DROP COLUMN "currentPeriodStart",
DROP COLUMN "plan",
DROP COLUMN "pricePerAsset",
DROP COLUMN "stripePriceId",
ADD COLUMN     "assetQuota" INTEGER NOT NULL,
ADD COLUMN     "billingCycle" TEXT NOT NULL;

-- DropTable
DROP TABLE "PlanLimit";

-- DropEnum
DROP TYPE "LimitType";
