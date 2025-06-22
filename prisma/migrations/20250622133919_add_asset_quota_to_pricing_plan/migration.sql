/*
  Warnings:

  - Added the required column `assetQuota` to the `PricingPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PricingPlan" ADD COLUMN     "assetQuota" INTEGER NOT NULL;
