-- AlterTable
ALTER TABLE "Co2eRecord" ADD COLUMN     "activityData" JSONB,
ADD COLUMN     "emissionFactor" DECIMAL(15,6),
ADD COLUMN     "emissionFactorSource" TEXT,
ADD COLUMN     "scope" INTEGER,
ADD COLUMN     "scopeCategory" TEXT;
