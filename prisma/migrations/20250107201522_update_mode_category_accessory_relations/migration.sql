/*
  Warnings:

  - You are about to drop the column `modelId` on the `Accessory` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Model` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Accessory" DROP CONSTRAINT "Accessory_modelId_fkey";

-- DropForeignKey
ALTER TABLE "Model" DROP CONSTRAINT "Model_categoryId_fkey";

-- DropIndex
DROP INDEX "Model_categoryId_idx";

-- AlterTable
ALTER TABLE "Accessory" DROP COLUMN "modelId",
ADD COLUMN     "model" TEXT;

-- AlterTable
ALTER TABLE "Model" DROP COLUMN "categoryId";

-- AddForeignKey
ALTER TABLE "Accessory" ADD CONSTRAINT "Accessory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
