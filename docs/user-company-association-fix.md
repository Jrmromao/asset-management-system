# User Company Association Fix

## Problem Description

Users were experiencing "User company not found" errors when accessing maintenance flows and other features that require company association. This was happening because:

1. Users were created in the database without a `companyId` during initial signup
2. The `companyId` was stored in Clerk metadata but not synced to the database
3. The maintenance flow actions were failing when they couldn't find the user's company

## Root Cause

The issue occurred when users signed up through Clerk but didn't complete the full company registration process, or when there was a mismatch between Clerk metadata and the database.

## Solution Implemented

### 1. Enhanced Maintenance Flow Actions

Updated `lib/actions/maintenanceFlow.actions.ts` to:
- Better error handling for missing company IDs
- Automatic metadata sync when company ID is missing
- Fallback to Clerk metadata if database doesn't have company ID
- Clear error messages for different scenarios

```typescript
// The function now automatically tries to sync metadata if company ID is missing
if (!user.companyId) {
  // Try to sync user metadata and get company ID from Clerk
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const companyIdFromClerk = clerkUser.privateMetadata?.companyId as string;
  
  if (companyIdFromClerk) {
    // Update the user's company ID in the database
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: { companyId: companyIdFromClerk },
    });
    user.companyId = updatedUser.companyId;
  }
}
```

### 2. User Metadata Sync API

Created `app/api/user/sync-metadata/route.ts` that:
- Checks user status in both database and Clerk
- Syncs company ID from Clerk metadata to database
- Provides detailed error messages and recommendations
- Handles edge cases like missing registration

### 3. React Hook for Automatic Sync

Created `hooks/useUserMetadataSync.ts` that:
- Provides easy-to-use functions for syncing metadata
- Automatically detects company-related errors
- Shows appropriate toast messages to users
- Can redirect to registration if needed

### 4. User Metadata Handler Component

Created `components/shared/UserMetadataHandler.tsx` that:
- Wraps pages to automatically handle metadata sync errors
- Listens for unhandled errors and attempts to fix them
- Can be used as a wrapper component or HOC

### 5. Debug Tools

Created debugging tools to help diagnose and fix issues:

#### Debug API (`app/api/debug/user-status/route.ts`)
- Comprehensive status check for users
- Shows database vs Clerk metadata comparison
- Lists all available companies
- Provides specific recommendations

#### Debug Component (`components/debug/UserMetadataDebugger.tsx`)
- UI for checking user status
- One-click metadata sync
- Visual display of issues and recommendations

## Usage

### For Developers

1. **Automatic Fix**: The maintenance flow actions now automatically attempt to sync metadata when company ID is missing.

2. **Manual Sync**: Use the sync API or hook when needed:
```typescript
import { useUserMetadataSync } from '@/hooks/useUserMetadataSync';

const { syncUserMetadata, handleCompanyNotFoundError } = useUserMetadataSync();

// Manual sync
await syncUserMetadata();

// Handle specific errors
const shouldRetry = await handleCompanyNotFoundError(error);
```

3. **Page-level Protection**: Wrap pages that might have company-related errors:
```typescript
import { UserMetadataHandler } from '@/components/shared/UserMetadataHandler';

export default function MyPage() {
  return (
    <UserMetadataHandler onSync={(companyId) => console.log('Synced:', companyId)}>
      <MyPageContent />
    </UserMetadataHandler>
  );
}
```

### For Administrators

1. **Debug User Issues**: Use the debug component to check user status:
```typescript
import { UserMetadataDebugger } from '@/components/debug/UserMetadataDebugger';

// Add to admin page
<UserMetadataDebugger />
```

2. **API Endpoints**:
- `GET /api/debug/user-status` - Check current user status
- `POST /api/user/sync-metadata` - Sync user metadata

## Error Scenarios Handled

1. **User exists but no company ID**: Syncs from Clerk metadata
2. **User not in database**: Directs to complete registration
3. **Metadata mismatch**: Updates database with Clerk data
4. **No company association**: Provides clear guidance

## Prevention

To prevent this issue in the future:

1. Ensure company registration process always updates both Clerk metadata AND database
2. Use the metadata sync utilities when creating new features that depend on company association
3. Add the UserMetadataHandler to critical pages
4. Regular monitoring using the debug tools

## Testing

You can test the fix by:

1. Using the debug component to check your current status
2. Manually triggering a sync via the API
3. Accessing maintenance flows that previously failed

The system will now automatically attempt to fix company association issues when they're detected. 