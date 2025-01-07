-- CreateTable
CREATE TABLE "ReportConfiguration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "timePeriod" TEXT NOT NULL,
    "isScheduled" BOOLEAN NOT NULL DEFAULT false,
    "scheduleFrequency" TEXT,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportMetric" (
    "id" TEXT NOT NULL,
    "reportConfigurationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReportMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedReport" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportConfiguration_companyId_idx" ON "ReportConfiguration"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportConfiguration_name_companyId_key" ON "ReportConfiguration"("name", "companyId");

-- CreateIndex
CREATE INDEX "ReportMetric_reportConfigurationId_idx" ON "ReportMetric"("reportConfigurationId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportMetric_reportConfigurationId_metricName_key" ON "ReportMetric"("reportConfigurationId", "metricName");

-- CreateIndex
CREATE INDEX "GeneratedReport_configurationId_idx" ON "GeneratedReport"("configurationId");

-- CreateIndex
CREATE INDEX "GeneratedReport_companyId_idx" ON "GeneratedReport"("companyId");

-- AddForeignKey
ALTER TABLE "ReportConfiguration" ADD CONSTRAINT "ReportConfiguration_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportMetric" ADD CONSTRAINT "ReportMetric_reportConfigurationId_fkey" FOREIGN KEY ("reportConfigurationId") REFERENCES "ReportConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "ReportConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedReport" ADD CONSTRAINT "GeneratedReport_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
