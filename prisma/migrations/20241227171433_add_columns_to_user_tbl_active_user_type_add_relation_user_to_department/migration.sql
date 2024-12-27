-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'Internal User',
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "departmentId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
