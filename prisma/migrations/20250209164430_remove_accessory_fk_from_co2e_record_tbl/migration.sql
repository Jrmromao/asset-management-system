/*
  Warnings:

  - You are about to drop the column `itemId` on the `Co2eRecord` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `Co2eRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_assetId_fkey";

-- DropIndex
DROP INDEX "Co2eRecord_itemId_idx";

-- DropIndex
DROP INDEX "Co2eRecord_itemType_idx";

-- DropIndex
DROP INDEX "Co2eRecord_userId_idx";

-- AlterTable
ALTER TABLE "Co2eRecord" DROP COLUMN "itemId",
ADD COLUMN     "accessoryId" TEXT,
ADD COLUMN     "assetId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Co2eRecord" ADD CONSTRAINT "Co2eRecord_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
