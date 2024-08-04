/*
  Warnings:

  - You are about to drop the column `isAchived` on the `StatusLable` table. All the data in the column will be lost.
  - Added the required column `isArchivable` to the `StatusLable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatusLable" DROP COLUMN "isAchived",
ADD COLUMN     "isArchivable" BOOLEAN NOT NULL;
