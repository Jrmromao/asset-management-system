/*
  Warnings:

  - You are about to alter the column `price` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `weight` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `purchasePrice` on the `License` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "License" ALTER COLUMN "purchasePrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);
