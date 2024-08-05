/*
  Warnings:

  - You are about to drop the column `statusLableId` on the `Asset` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `StatusLable` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_statusLableId_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "statusLableId",
ADD COLUMN     "statusLabelId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "StatusLable_name_key" ON "StatusLable"("name");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_statusLabelId_fkey" FOREIGN KEY ("statusLabelId") REFERENCES "StatusLable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
