/*
  Warnings:

  - You are about to drop the column `accessoryId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `licenseId` on the `AuditLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_licenseId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "accessoryId",
DROP COLUMN "licenseId";
