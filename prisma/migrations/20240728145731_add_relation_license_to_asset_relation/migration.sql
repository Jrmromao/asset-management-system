/*
  Warnings:

  - You are about to drop the column `certificateUrl` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `licenceUrl` on the `Asset` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "certificateUrl",
DROP COLUMN "licenceUrl",
ADD COLUMN     "licenseId" INTEGER;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE SET NULL ON UPDATE CASCADE;
