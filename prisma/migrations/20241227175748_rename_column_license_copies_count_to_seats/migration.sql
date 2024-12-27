/*
  Warnings:

  - You are about to drop the column `licenseCopiesCount` on the `License` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "licenseCopiesCount",
ADD COLUMN     "seats" INTEGER NOT NULL DEFAULT 0;
