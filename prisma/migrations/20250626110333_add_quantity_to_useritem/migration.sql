/*
  Warnings:

  - You are about to drop the column `itemId` on the `UserItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,licenseId,accessoryId,assetId,itemType]` on the table `UserItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "ItemType" ADD VALUE 'ASSET';

-- DropForeignKey
ALTER TABLE "UserItem" DROP CONSTRAINT "UserItem_accessory_fkey";

-- DropForeignKey
ALTER TABLE "UserItem" DROP CONSTRAINT "UserItem_license_fkey";

-- DropIndex
DROP INDEX "UserItem_itemId_itemType_idx";

-- DropIndex
DROP INDEX "UserItem_userId_itemId_itemType_key";

-- AlterTable
ALTER TABLE "UserItem" DROP COLUMN "itemId",
ADD COLUMN     "accessoryId" TEXT,
ADD COLUMN     "assetId" TEXT,
ADD COLUMN     "licenseId" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "UserItem_licenseId_itemType_idx" ON "UserItem"("licenseId", "itemType");

-- CreateIndex
CREATE INDEX "UserItem_accessoryId_itemType_idx" ON "UserItem"("accessoryId", "itemType");

-- CreateIndex
CREATE INDEX "UserItem_assetId_itemType_idx" ON "UserItem"("assetId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "UserItem_userId_licenseId_accessoryId_assetId_itemType_key" ON "UserItem"("userId", "licenseId", "accessoryId", "assetId", "itemType");

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
