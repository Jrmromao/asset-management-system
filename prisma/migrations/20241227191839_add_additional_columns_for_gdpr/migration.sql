-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "dataAccessed" JSONB,
ADD COLUMN     "ipAddress" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dataProcessingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dataRetentionDate" TIMESTAMP(3),
ADD COLUMN     "lastConsentUpdate" TIMESTAMP(3),
ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserConsent" ADD CONSTRAINT "UserConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
