-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "purchaseOrderId" TEXT;

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "endOfLife" DROP NOT NULL;

-- AlterTable
ALTER TABLE "License" ADD COLUMN     "purchaseOrderId" TEXT;
