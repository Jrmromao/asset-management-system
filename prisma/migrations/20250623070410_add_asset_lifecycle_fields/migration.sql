-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "endOfLifePlan" TEXT,
ADD COLUMN     "energyConsumption" DECIMAL(65,30),
ADD COLUMN     "expectedLifespan" INTEGER;
