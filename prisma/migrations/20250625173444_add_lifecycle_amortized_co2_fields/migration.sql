-- AlterTable
ALTER TABLE "Co2eRecord" ADD COLUMN     "amortizedAnnualCo2e" DECIMAL(15,4),
ADD COLUMN     "amortizedMonthlyCo2e" DECIMAL(15,4),
ADD COLUMN     "expectedLifespanYears" INTEGER,
ADD COLUMN     "lifecycleEndOfLife" DECIMAL(15,2),
ADD COLUMN     "lifecycleManufacturing" DECIMAL(15,2),
ADD COLUMN     "lifecycleTransport" DECIMAL(15,2),
ADD COLUMN     "lifecycleUse" DECIMAL(15,2);
