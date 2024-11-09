/*
  Warnings:

  - You are about to drop the `Co2eRecord` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_accessoryId_fkey";

-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Co2eRecord" DROP CONSTRAINT "Co2eRecord_userId_fkey";

-- DropTable
DROP TABLE "Co2eRecord";
