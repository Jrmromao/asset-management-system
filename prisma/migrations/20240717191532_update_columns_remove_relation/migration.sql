/*
  Warnings:

  - You are about to drop the column `description` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `License` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `brand` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `certificateUrl` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenceUrl` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "License" DROP CONSTRAINT "License_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_assetId_fkey";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "description",
DROP COLUMN "userId",
ADD COLUMN     "assigneeId" INTEGER,
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "certificateUrl" TEXT NOT NULL,
ADD COLUMN     "licenceUrl" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "serialNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "note";

-- DropTable
DROP TABLE "License";

-- CreateTable
CREATE TABLE "LicenseTool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "issuedDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseTool_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LicenseTool" ADD CONSTRAINT "LicenseTool_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
