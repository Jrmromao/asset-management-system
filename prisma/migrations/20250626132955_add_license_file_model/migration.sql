/*
  Warnings:

  - You are about to drop the column `licenseFileUrl` on the `License` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "licenseFileUrl";

-- CreateTable
CREATE TABLE "LicenseFile" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,

    CONSTRAINT "LicenseFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LicenseFile_licenseId_idx" ON "LicenseFile"("licenseId");

-- AddForeignKey
ALTER TABLE "LicenseFile" ADD CONSTRAINT "LicenseFile_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
