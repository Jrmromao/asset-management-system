/*
  Warnings:

  - Made the column `categoryId` on table `FormTemplate` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "FormTemplate" ALTER COLUMN "categoryId" SET NOT NULL;
