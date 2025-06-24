/*
  Warnings:

  - You are about to alter the column `price` on the `Accessory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "averageCostPerUnit" DECIMAL(10,4),
ADD COLUMN     "budgetCode" TEXT,
ADD COLUMN     "costCenter" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "currentValue" DECIMAL(10,2),
ADD COLUMN     "depreciationRate" DECIMAL(5,4),
ADD COLUMN     "lastPurchasePrice" DECIMAL(10,2),
ADD COLUMN     "replacementCost" DECIMAL(10,2),
ADD COLUMN     "totalValue" DECIMAL(10,2),
ADD COLUMN     "unitCost" DECIMAL(10,2),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "License" ADD COLUMN     "annualPrice" DECIMAL(10,2),
ADD COLUMN     "billingCycle" TEXT DEFAULT 'annual',
ADD COLUMN     "budgetCode" TEXT,
ADD COLUMN     "costCenter" TEXT,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "discountPercent" DECIMAL(5,2),
ADD COLUMN     "lastUsageAudit" TIMESTAMP(3),
ADD COLUMN     "monthlyPrice" DECIMAL(10,2),
ADD COLUMN     "pricePerSeat" DECIMAL(10,4),
ADD COLUMN     "renewalPrice" DECIMAL(10,2),
ADD COLUMN     "taxRate" DECIMAL(5,4),
ADD COLUMN     "utilizationRate" DECIMAL(5,4);

-- CreateTable
CREATE TABLE "CostOptimizationAnalysis" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisType" TEXT NOT NULL,
    "totalPotentialSavings" DECIMAL(12,2) NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "analysisData" JSONB NOT NULL,
    "implementedSavings" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostOptimizationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostOptimizationRecommendation" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "potentialSavings" DECIMAL(10,2) NOT NULL,
    "confidenceScore" DECIMAL(3,2) NOT NULL,
    "implementationEffort" TEXT NOT NULL,
    "timeToValue" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 100,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "actualSavings" DECIMAL(10,2),
    "implementedAt" TIMESTAMP(3),
    "implementedBy" TEXT,
    "notes" TEXT,
    "affectedAssets" JSONB,
    "actionItems" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostOptimizationRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CostBudget" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "budgetYear" INTEGER NOT NULL,
    "budgetPeriod" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "budgetedAmount" DECIMAL(12,2) NOT NULL,
    "actualAmount" DECIMAL(12,2),
    "forecastedAmount" DECIMAL(12,2),
    "variance" DECIMAL(12,2),
    "costCenter" TEXT,
    "departmentId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostBudget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CostOptimizationAnalysis_companyId_idx" ON "CostOptimizationAnalysis"("companyId");

-- CreateIndex
CREATE INDEX "CostOptimizationAnalysis_analysisType_idx" ON "CostOptimizationAnalysis"("analysisType");

-- CreateIndex
CREATE INDEX "CostOptimizationAnalysis_createdAt_idx" ON "CostOptimizationAnalysis"("createdAt");

-- CreateIndex
CREATE INDEX "CostOptimizationRecommendation_analysisId_idx" ON "CostOptimizationRecommendation"("analysisId");

-- CreateIndex
CREATE INDEX "CostOptimizationRecommendation_status_idx" ON "CostOptimizationRecommendation"("status");

-- CreateIndex
CREATE INDEX "CostOptimizationRecommendation_priority_idx" ON "CostOptimizationRecommendation"("priority");

-- CreateIndex
CREATE INDEX "CostOptimizationRecommendation_implementedAt_idx" ON "CostOptimizationRecommendation"("implementedAt");

-- CreateIndex
CREATE INDEX "CostBudget_companyId_idx" ON "CostBudget"("companyId");

-- CreateIndex
CREATE INDEX "CostBudget_budgetYear_idx" ON "CostBudget"("budgetYear");

-- CreateIndex
CREATE INDEX "CostBudget_category_idx" ON "CostBudget"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CostBudget_companyId_budgetYear_budgetPeriod_category_costC_key" ON "CostBudget"("companyId", "budgetYear", "budgetPeriod", "category", "costCenter");

-- AddForeignKey
ALTER TABLE "CostOptimizationAnalysis" ADD CONSTRAINT "CostOptimizationAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostOptimizationRecommendation" ADD CONSTRAINT "CostOptimizationRecommendation_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "CostOptimizationAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostBudget" ADD CONSTRAINT "CostBudget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostBudget" ADD CONSTRAINT "CostBudget_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
