/*
  Warnings:

  - You are about to drop the column `maxAssets` on the `PricingPlan` table. All the data in the column will be lost.
  - You are about to drop the column `minAssets` on the `PricingPlan` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LimitType" AS ENUM ('ASSETS', 'USERS', 'API_CALLS_PER_MONTH');

-- AlterTable
ALTER TABLE "PricingPlan" DROP COLUMN "maxAssets",
DROP COLUMN "minAssets";

-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" "LimitType" NOT NULL,
    "limit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_planId_type_key" ON "PlanLimit"("planId", "type");

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "PricingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
