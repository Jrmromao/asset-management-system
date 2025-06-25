-- CreateTable
CREATE TABLE "ReportDownload" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "userId" TEXT,
    "downloadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileSize" INTEGER,
    "format" TEXT,
    "reportType" TEXT,

    CONSTRAINT "ReportDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportCleanupLog" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "spaceSaved" INTEGER NOT NULL DEFAULT 0,
    "reasoning" TEXT,
    "confidence" DOUBLE PRECISION,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedBy" TEXT,

    CONSTRAINT "ReportCleanupLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileProtectionRule" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "filePath" TEXT,
    "filePattern" TEXT,
    "protectionType" TEXT NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "FileProtectionRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleanupPolicy" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "maxFiles" INTEGER,
    "maxSizeGB" DOUBLE PRECISION,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CleanupPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageAnalytics" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalFiles" INTEGER NOT NULL,
    "totalSizeBytes" BIGINT NOT NULL,
    "averageFileAge" INTEGER,
    "duplicateFiles" INTEGER,
    "unusedFiles" INTEGER,
    "compressionPotential" DOUBLE PRECISION,
    "insights" TEXT,

    CONSTRAINT "StorageAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportDownload_companyId_filePath_idx" ON "ReportDownload"("companyId", "filePath");

-- CreateIndex
CREATE INDEX "ReportDownload_downloadedAt_idx" ON "ReportDownload"("downloadedAt");

-- CreateIndex
CREATE INDEX "ReportDownload_companyId_idx" ON "ReportDownload"("companyId");

-- CreateIndex
CREATE INDEX "ReportCleanupLog_companyId_executedAt_idx" ON "ReportCleanupLog"("companyId", "executedAt");

-- CreateIndex
CREATE INDEX "ReportCleanupLog_companyId_idx" ON "ReportCleanupLog"("companyId");

-- CreateIndex
CREATE INDEX "FileProtectionRule_companyId_filePath_idx" ON "FileProtectionRule"("companyId", "filePath");

-- CreateIndex
CREATE INDEX "FileProtectionRule_companyId_idx" ON "FileProtectionRule"("companyId");

-- CreateIndex
CREATE INDEX "CleanupPolicy_companyId_format_idx" ON "CleanupPolicy"("companyId", "format");

-- CreateIndex
CREATE INDEX "CleanupPolicy_companyId_idx" ON "CleanupPolicy"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CleanupPolicy_name_companyId_key" ON "CleanupPolicy"("name", "companyId");

-- CreateIndex
CREATE INDEX "StorageAnalytics_companyId_idx" ON "StorageAnalytics"("companyId");

-- CreateIndex
CREATE INDEX "StorageAnalytics_analysisDate_idx" ON "StorageAnalytics"("analysisDate");

-- AddForeignKey
ALTER TABLE "ReportDownload" ADD CONSTRAINT "ReportDownload_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCleanupLog" ADD CONSTRAINT "ReportCleanupLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileProtectionRule" ADD CONSTRAINT "FileProtectionRule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CleanupPolicy" ADD CONSTRAINT "CleanupPolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageAnalytics" ADD CONSTRAINT "StorageAnalytics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
