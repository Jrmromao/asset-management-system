/*
  Warnings:

  - You are about to drop the column `expirationDate` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `issuedDate` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `License` table. All the data in the column will be lost.
  - Added the required column `alertRenewalDays` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseCopiesCount` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseKey` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licensedEmail` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minCopiesAlert` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchaseDate` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasePrice` to the `License` table without a default value. This is not possible if the table is not empty.
  - Added the required column `renewalDate` to the `License` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "expirationDate",
DROP COLUMN "issuedDate",
DROP COLUMN "key",
ADD COLUMN     "alertRenewalDays" INTEGER NOT NULL,
ADD COLUMN     "licenseCopiesCount" INTEGER NOT NULL,
ADD COLUMN     "licenseKey" TEXT NOT NULL,
ADD COLUMN     "licensedEmail" TEXT NOT NULL,
ADD COLUMN     "minCopiesAlert" INTEGER NOT NULL,
ADD COLUMN     "purchaseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "purchaseNotes" TEXT,
ADD COLUMN     "purchasePrice" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "renewalDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vendor" TEXT;
