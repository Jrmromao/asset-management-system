/*
  Warnings:

  - Added the required column `licenseId` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "licenseId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
