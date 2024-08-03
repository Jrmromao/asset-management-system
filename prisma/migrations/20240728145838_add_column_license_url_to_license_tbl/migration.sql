/*
  Warnings:

  - Added the required column `licenseUrl` to the `License` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "License" ADD COLUMN     "licenseUrl" TEXT NOT NULL;
