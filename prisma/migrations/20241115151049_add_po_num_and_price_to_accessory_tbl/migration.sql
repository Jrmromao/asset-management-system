/*
  Warnings:

  - A unique constraint covering the columns `[poNumber]` on the table `Accessory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Accessory" ADD COLUMN     "poNumber" TEXT,
ADD COLUMN     "price" DECIMAL(65,30);

-- CreateIndex
CREATE UNIQUE INDEX "Accessory_poNumber_key" ON "Accessory"("poNumber");
