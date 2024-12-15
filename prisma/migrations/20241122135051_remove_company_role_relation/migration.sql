/*
  Warnings:

  - You are about to drop the column `companyId` on the `Role` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_companyId_fkey";

-- DropIndex
DROP INDEX "Role_companyId_idx";

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "companyId";
