/*
  Warnings:

  - You are about to drop the column `departmdntId` on the `Asset` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_departmdntId_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "departmdntId",
ADD COLUMN     "departmentId" TEXT;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
