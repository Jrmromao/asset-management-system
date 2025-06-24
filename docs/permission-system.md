# Permission System Documentation

## Overview

This permission system provides a scalable foundation for role-based access control while keeping the MVP simple with just 3 roles: **Admin**, **User**, and **Loanee**.

## Architecture

### 🎯 MVP Approach
- **Simple**: 3 predefined roles with clear permissions
- **Fast**: Easy to implement and understand
- **Scalable**: Built on a foundation that can grow to enterprise-level permissions

### 🏗️ Core Components

1. **Permission Utilities** (`lib/utils/permissions.ts`)
2. **React Hook** (`hooks/usePermissions.ts`)  
3. **Guard Components** (`components/auth/PermissionGuard.tsx`)

## Role Definitions

### Admin
- **Permissions**: `admin.all` (full access to everything)
- **Can**: Manage users, assets, company settings, view reports, etc.
- **Cannot**: Nothing - full access

### User  
- **Permissions**: 
  - Assets: view, create, edit, assign, export
  - Users: view (limited)
  - Categories: view, create, edit
  - Reports: view, export
- **Can**: Manage assets, view team, basic reporting
- **Cannot**: Delete assets, manage users, company settings

### Loanee
- **Permissions**: `assets.view` (very limited)
- **Can**: View assigned assets only
- **Cannot**: Login to the system, modify anything

## Usage Examples

### 1. Basic Permission Checking

```tsx
import { usePermissions } from "@/hooks/usePermissions";

function MyComponent() {
  const permissions = usePermissions();

  return (
    <div>
      {permissions.canCreateAssets && (
        <button>Create Asset</button>
      )}
      
      {permissions.isAdmin && (
        <button>Admin Panel</button>
      )}
    </div>
  );
}
```

### 2. Component Guards

```tsx
import { PermissionGuard, AdminOnly, AssetActions } from "@/components/auth/PermissionGuard";

function AssetPage() {
  return (
    <div>
      {/* Admin-only button */}
      <AdminOnly>
        <button>Delete All Assets</button>
      </AdminOnly>
      
      {/* Asset creation */}
      <AssetActions action="create">
        <button>Create Asset</button>
      </AssetActions>
      
      {/* Custom permission */}
      <PermissionGuard permission="reports.export">
        <button>Export Report</button>
      </PermissionGuard>
    </div>
  );
}
```

### 3. Navigation Menu

```tsx
function Navigation() {
  const permissions = usePermissions();

  const menuItems = [
    { label: "Assets", href: "/assets", show: permissions.canViewAssets },
    { label: "People", href: "/people", show: permissions.canViewUsers },
    { label: "Admin", href: "/admin", show: permissions.isAdmin },
  ].filter(item => item.show);

  return (
    <nav>
      {menuItems.map(item => (
        <a key={item.href} href={item.href}>{item.label}</a>
      ))}
    </nav>
  );
}
```

### 4. Server-Side Permissions

```tsx
// API Route Example
import { hasPermission } from "@/lib/utils/permissions";

export async function POST(req: Request) {
  const userRole = await getUserRole(); // Get from DB or Clerk
  
  if (!hasPermission(userRole, "assets.create")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Proceed with creation...
}
```

## Available Permissions

### Asset Management
- `assets.view` - View assets
- `assets.create` - Create new assets  
- `assets.edit` - Edit existing assets
- `assets.delete` - Delete assets (Admin only)
- `assets.assign` - Assign assets to users
- `assets.export` - Export asset data

### User Management  
- `users.view` - View user list
- `users.invite` - Invite new users
- `users.edit` - Edit user details
- `users.delete` - Delete users (Admin only)
- `users.export` - Export user data

### Company & Admin
- `company.settings` - Company configuration
- `company.billing` - Billing management
- `roles.create` - Create custom roles
- `audit.view` - View audit logs

### Reports
- `reports.view` - View reports
- `reports.create` - Create custom reports
- `reports.export` - Export report data

## Scaling to Enterprise

When you need more granular permissions:

### 1. Custom Roles
```tsx
// Add to database
const customRole = {
  name: "Asset Manager",
  permissions: [
    "assets.view",
    "assets.create", 
    "assets.edit",
    "assets.assign",
    "users.view"
  ],
  isCustom: true,
  companyId: "company-123"
};
```

### 2. Department-Based Permissions
```tsx
// Future enhancement
const departmentRole = {
  name: "HR Manager", 
  permissions: ["users.*", "reports.hr"],
  department: "Human Resources"
};
```

### 3. Resource-Level Permissions
```tsx
// Future enhancement  
const resourcePermission = {
  userId: "user-123",
  resourceType: "asset",
  resourceId: "asset-456", 
  permissions: ["view", "edit"]
};
```

## Migration Path

### Phase 1 (Current MVP)
- 3 fixed roles
- Permission checks via role name
- Simple but functional

### Phase 2 (Enhanced)
- Permission-based checks (already implemented)
- Same 3 roles but using permission system
- Zero breaking changes

### Phase 3 (Enterprise)
- Custom roles per company
- Granular permissions
- Department-based access
- Resource-level permissions

## Best Practices

### ✅ Do
- Use permission guards for UI elements
- Check permissions on both client and server
- Provide fallback content for denied access
- Use the hook for complex permission logic

### ❌ Don't  
- Rely only on client-side permission checks
- Hardcode role names throughout the app
- Forget to handle loading states
- Skip permission checks on API routes

## Testing Permissions

```tsx
// Test different roles
const testPermissions = {
  Admin: getRolePermissions("Admin"),
  User: getRolePermissions("User"), 
  Loanee: getRolePermissions("Loanee")
};

console.log("Admin permissions:", testPermissions.Admin);
// Output: ["admin.all"]

console.log("Can User create assets?", hasPermission("User", "assets.create"));
// Output: true

console.log("Can Loanee delete assets?", hasPermission("Loanee", "assets.delete"));  
// Output: false
```

## Future Enhancements

1. **Permission Templates**: Predefined permission sets for common roles
2. **Time-Based Permissions**: Temporary access grants
3. **Conditional Permissions**: Context-aware permissions
4. **Audit Trail**: Track permission changes and usage
5. **Permission Inheritance**: Role hierarchies

This system gives you the simplicity you need for MVP while building the foundation for enterprise-scale permission management! 🚀 