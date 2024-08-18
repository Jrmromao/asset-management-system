-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "StatusLable" ADD COLUMN     "companyId" TEXT;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusLable" ADD CONSTRAINT "StatusLable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
