-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pricingPlanId" TEXT;

-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stripePriceId" TEXT NOT NULL,
    "planType" "PlanType" NOT NULL,
    "pricePerAsset" DECIMAL(10,2) NOT NULL,
    "minAssets" INTEGER NOT NULL DEFAULT 100,
    "maxAssets" INTEGER,
    "trialDays" INTEGER NOT NULL DEFAULT 30,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "features" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_name_key" ON "PricingPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_stripePriceId_key" ON "PricingPlan"("stripePriceId");

-- CreateIndex
CREATE INDEX "PricingPlan_planType_idx" ON "PricingPlan"("planType");

-- CreateIndex
CREATE INDEX "PricingPlan_isActive_idx" ON "PricingPlan"("isActive");

-- CreateIndex
CREATE INDEX "PricingPlan_stripePriceId_idx" ON "PricingPlan"("stripePriceId");

-- CreateIndex
CREATE INDEX "Subscription_pricingPlanId_idx" ON "Subscription"("pricingPlanId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
