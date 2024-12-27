/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `Accessory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Accessory" DROP CONSTRAINT "Accessory_assigneeId_fkey";

-- AlterTable
ALTER TABLE "Accessory" DROP COLUMN "assigneeId";

-- CreateTable
CREATE TABLE "UserAccessory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessoryId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnedAt" TIMESTAMP(3),
    "notes" TEXT,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "UserAccessory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAccessory_userId_idx" ON "UserAccessory"("userId");

-- CreateIndex
CREATE INDEX "UserAccessory_accessoryId_idx" ON "UserAccessory"("accessoryId");

-- CreateIndex
CREATE INDEX "UserAccessory_companyId_idx" ON "UserAccessory"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccessory_userId_accessoryId_key" ON "UserAccessory"("userId", "accessoryId");

-- AddForeignKey
ALTER TABLE "UserAccessory" ADD CONSTRAINT "UserAccessory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessory" ADD CONSTRAINT "UserAccessory_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "Accessory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAccessory" ADD CONSTRAINT "UserAccessory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
