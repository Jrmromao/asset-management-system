-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "departmdntId" TEXT,
ADD COLUMN     "locationId" TEXT,
ADD COLUMN     "weight" DECIMAL(65,30);

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_departmdntId_fkey" FOREIGN KEY ("departmdntId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "DepartmentLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
