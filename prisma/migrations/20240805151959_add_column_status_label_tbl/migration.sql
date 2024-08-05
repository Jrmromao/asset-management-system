/*
  Warnings:

  - Added the required column `description` to the `StatusLable` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StatusLable" ADD COLUMN     "description" TEXT NOT NULL;
