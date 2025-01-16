/*
  Warnings:

  - You are about to drop the `UserAccessory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLicense` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('LICENSE', 'ACCESSORY');

-- DropForeignKey
ALTER TABLE "UserAccessory" DROP CONSTRAINT "UserAccessory_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "UserAccessory" DROP CONSTRAINT "UserAccessory_companyId_fkey";

-- DropForeignKey
ALTER TABLE "UserAccessory" DROP CONSTRAINT "UserAccessory_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserLicense" DROP CONSTRAINT "UserLicense_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "UserLicense" DROP CONSTRAINT "UserLicense_userId_fkey";

-- DropTable
DROP TABLE "UserAccessory";

-- DropTable
DROP TABLE "UserLicense";

-- CreateTable
CREATE TABLE "UserItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemType" "ItemType" NOT NULL,
    "licenseId" TEXT,
    "accessoryId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "UserItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserItem_userId_idx" ON "UserItem"("userId");

-- CreateIndex
CREATE INDEX "UserItem_licenseId_idx" ON "UserItem"("licenseId");

-- CreateIndex
CREATE INDEX "UserItem_accessoryId_idx" ON "UserItem"("accessoryId");

-- CreateIndex
CREATE INDEX "UserItem_companyId_idx" ON "UserItem"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserItem_userId_licenseId_key" ON "UserItem"("userId", "licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserItem_userId_accessoryId_key" ON "UserItem"("userId", "accessoryId");

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserItem" ADD CONSTRAINT "UserItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
