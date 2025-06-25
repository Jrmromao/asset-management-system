-- CreateTable
CREATE TABLE "MaintenanceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "estimatedDuration" INTEGER NOT NULL DEFAULT 1,
    "requiredSkills" JSONB NOT NULL DEFAULT '[]',
    "defaultCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "icon" TEXT NOT NULL DEFAULT 'wrench',
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "customFields" JSONB NOT NULL DEFAULT '[]',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaintenanceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MaintenanceCategory_companyId_idx" ON "MaintenanceCategory"("companyId");

-- CreateIndex
CREATE INDEX "MaintenanceCategory_isActive_idx" ON "MaintenanceCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceCategory_name_companyId_key" ON "MaintenanceCategory"("name", "companyId");

-- CreateIndex
CREATE INDEX "MaintenanceType_companyId_idx" ON "MaintenanceType"("companyId");

-- CreateIndex
CREATE INDEX "MaintenanceType_categoryId_idx" ON "MaintenanceType"("categoryId");

-- CreateIndex
CREATE INDEX "MaintenanceType_isActive_idx" ON "MaintenanceType"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "MaintenanceType_name_companyId_key" ON "MaintenanceType"("name", "companyId");

-- AddForeignKey
ALTER TABLE "MaintenanceCategory" ADD CONSTRAINT "MaintenanceCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceType" ADD CONSTRAINT "MaintenanceType_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceType" ADD CONSTRAINT "MaintenanceType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MaintenanceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
