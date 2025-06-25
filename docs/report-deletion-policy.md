# Report Deletion Policy & Cleanup System

## Overview

Our asset management system implements a comprehensive deletion policy for generated reports to manage storage costs and maintain system performance. The policy is designed to balance data retention needs with storage efficiency.

## 📋 Default Retention Policies

### By Report Format

| Format | Max Age | Max Reports/Config | Max Total Size | Use Case |
|--------|---------|-------------------|----------------|----------|
| **PDF** | 90 days | 50 reports | 500 MB | Business archives, official documents |
| **Excel** | 60 days | 30 reports | 200 MB | Data analysis, business reports |
| **CSV** | 30 days | 20 reports | 100 MB | Data exports, quick analysis |
| **Dashboard** | 7 days | 10 reports | 50 MB | Temporary data, real-time insights |

## 🔄 Cleanup Rules

The system applies multiple rules to determine which reports to delete:

### 1. **Age-Based Cleanup**
- Reports older than the format-specific maximum age are automatically deleted
- Helps prevent indefinite storage growth

### 2. **Count-Based Cleanup**
- Keeps only the most recent N reports per configuration
- Prevents excessive report accumulation for frequently generated reports

### 3. **Size-Based Cleanup**
- If total storage exceeds format limits, oldest reports are deleted first
- Maintains predictable storage costs

### 4. **Orphaned File Cleanup**
- Removes S3 files that don't have corresponding database records
- Prevents storage leaks from failed operations

## 🚀 Usage

### Manual Cleanup

```typescript
// Get storage statistics
const response = await fetch('/api/reports/cleanup', {
  method: 'GET'
});
const { stats } = await response.json();

// Trigger manual cleanup
const cleanupResponse = await fetch('/api/reports/cleanup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    action: 'cleanup',
    customPolicies: {
      pdf: { maxAgeInDays: 120 } // Override default policy
    }
  })
});
```

### Automated Cleanup

Set up a cron job or scheduled task to call:

```bash
# Daily cleanup at 2 AM
curl -X POST https://your-domain.com/api/reports/scheduled-cleanup \
  -H "Authorization: Bearer YOUR_CLEANUP_TOKEN" \
  -H "Content-Type: application/json"
```

### Custom Retention Policies

```typescript
const customPolicies = {
  pdf: {
    maxAgeInDays: 180,        // Keep PDFs for 6 months
    maxReportsPerConfiguration: 100,
    maxTotalSizeInMB: 1000,
  },
  excel: {
    maxAgeInDays: 90,         // Keep Excel files for 3 months
    maxReportsPerConfiguration: 50,
    maxTotalSizeInMB: 500,
  }
};
```

## 🛡️ Safety Features

### 1. **Graceful Error Handling**
- S3 deletion failures don't prevent database cleanup
- Partial failures are logged and reported
- System continues processing other reports

### 2. **Transaction Safety**
- Database operations use transactions where possible
- Rollback on critical failures

### 3. **Audit Trail**
- All cleanup operations are logged
- Statistics provided for monitoring
- Error tracking for troubleshooting

## 📊 Monitoring

### Storage Statistics

```typescript
interface StorageStats {
  totalReports: number;
  totalSizeInMB: number;
  reportsByFormat: {
    [format: string]: {
      count: number;
      sizeInMB: number;
    };
  };
  oldestReport: Date | null;
  newestReport: Date | null;
}
```

### Cleanup Statistics

```typescript
interface CleanupStats {
  deletedReports: number;
  deletedFiles: number;
  freedSpace: number; // in MB
  errors: string[];
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Required for scheduled cleanup
CLEANUP_CRON_TOKEN=your-secure-random-token

# AWS S3 configuration (already configured)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=your-region
```

### Database Schema

The cleanup system leverages existing CASCADE relationships:

```sql
-- Report configurations cascade to generated reports
ALTER TABLE "GeneratedReport" 
ADD CONSTRAINT "GeneratedReport_configurationId_fkey" 
FOREIGN KEY ("configurationId") REFERENCES "ReportConfiguration"("id") 
ON DELETE CASCADE;

-- Company deletion cascades to all reports
ALTER TABLE "GeneratedReport" 
ADD CONSTRAINT "GeneratedReport_companyId_fkey" 
FOREIGN KEY ("companyId") REFERENCES "Company"("id") 
ON DELETE CASCADE;
```

## 🎯 Best Practices

### 1. **Regular Monitoring**
- Check storage statistics weekly
- Monitor cleanup logs for errors
- Adjust policies based on usage patterns

### 2. **Custom Policies for Different Needs**
- Compliance reports: Longer retention
- Temporary exports: Shorter retention
- Critical business reports: Higher limits

### 3. **Backup Critical Reports**
- Download important reports before they're auto-deleted
- Consider external archival for regulatory compliance

### 4. **Schedule Cleanup During Off-Hours**
- Run automated cleanup during low-usage periods
- Avoid peak business hours

## 🚨 Emergency Procedures

### Disable Automatic Cleanup
```typescript
// Temporarily disable by setting very high limits
const emergencyPolicies = {
  pdf: { maxAgeInDays: 99999, maxReportsPerConfiguration: 99999, maxTotalSizeInMB: 999999 },
  excel: { maxAgeInDays: 99999, maxReportsPerConfiguration: 99999, maxTotalSizeInMB: 999999 },
  csv: { maxAgeInDays: 99999, maxReportsPerConfiguration: 99999, maxTotalSizeInMB: 999999 },
  dashboard: { maxAgeInDays: 99999, maxReportsPerConfiguration: 99999, maxTotalSizeInMB: 999999 },
};
```

### Recover from Accidental Deletion
- Check S3 versioning if enabled
- Restore from database backups
- Regenerate reports from source data if available

## 📞 Support

For issues with the cleanup system:

1. Check the cleanup API logs
2. Verify S3 permissions and connectivity
3. Monitor database performance during cleanup
4. Contact system administrators for policy adjustments

---

**Last Updated:** January 2025  
**Version:** 1.0 