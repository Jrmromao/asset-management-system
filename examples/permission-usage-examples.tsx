// Permission System Usage Examples
// This file shows how to use the new permission system in your components

import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { 
  PermissionGuard, 
  AdminOnly, 
  AssetActions, 
  UserActions,
  useConditionalRender 
} from "@/components/auth/PermissionGuard";
import { Button } from "@/components/ui/button";

// Example 1: Using the usePermissions hook directly
function MyComponent() {
  const permissions = usePermissions();

  if (permissions.loading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div>
      <h1>Welcome, {permissions.role}!</h1>
      
      {/* Simple permission check */}
      {permissions.canCreateAssets && (
        <Button>Create Asset</Button>
      )}
      
      {/* Multiple permission checks */}
      {permissions.isAdmin && (
        <div>
          <h2>Admin Panel</h2>
          <Button>Manage Users</Button>
          <Button>Company Settings</Button>
        </div>
      )}
      
      {/* Check specific permission */}
      {permissions.hasPermission("reports.export") && (
        <Button>Export Reports</Button>
      )}
    </div>
  );
}

// Example 2: Using PermissionGuard components
function AssetManagementPanel() {
  return (
    <div>
      <h2>Asset Management</h2>
      
      {/* Admin-only section */}
      <AdminOnly fallback={<p>Admin access required</p>}>
        <Button variant="destructive">Delete All Assets</Button>
      </AdminOnly>
      
      {/* Asset-specific actions */}
      <AssetActions action="create">
        <Button>Create New Asset</Button>
      </AssetActions>
      
      <AssetActions action="export" fallback={<p>No export permission</p>}>
        <Button>Export Assets</Button>
      </AssetActions>
      
      {/* User management actions */}
      <UserActions action="invite">
        <Button>Invite User</Button>
      </UserActions>
      
      {/* Custom permission check */}
      <PermissionGuard permission="company.settings">
        <Button>Company Settings</Button>
      </PermissionGuard>
      
      {/* Multiple permissions (user needs ALL) */}
      <PermissionGuard 
        permissions={["assets.delete", "assets.edit"]} 
        requireAll={true}
        fallback={<p>Need both delete and edit permissions</p>}
      >
        <Button>Advanced Asset Management</Button>
      </PermissionGuard>
      
      {/* Multiple permissions (user needs ANY) */}
      <PermissionGuard 
        permissions={["assets.create", "assets.edit"]} 
        requireAll={false}
      >
        <Button>Create or Edit Assets</Button>
      </PermissionGuard>
      
      {/* Role-based access */}
      <PermissionGuard roles={["Admin", "User"]}>
        <Button>For Admins and Users only</Button>
      </PermissionGuard>
      
      {/* Action-based shorthand */}
      <PermissionGuard action="view" resource="reports">
        <Button>View Reports</Button>
      </PermissionGuard>
    </div>
  );
}

// Example 3: Using conditional rendering hook
function DashboardWidget() {
  const { renderIf, renderIfPermission, renderIfAdmin, renderIfCanPerform } = useConditionalRender();
  const permissions = usePermissions();

  return (
    <div>
      <h2>Dashboard</h2>
      
      {/* Conditional rendering based on permission */}
      {renderIfPermission("assets.view", 
        <div>Asset count: 42</div>
      )}
      
      {/* Admin-only content */}
      {renderIfAdmin(
        <div>Admin dashboard content</div>,
        <div>Regular user content</div>
      )}
      
      {/* Action-based conditional rendering */}
      {renderIfCanPerform("create", "users",
        <Button>Add User</Button>
      )}
      
      {/* Complex condition */}
      {renderIf(
        permissions.isAdmin || permissions.canViewReports,
        <div>Reports section</div>
      )}
    </div>
  );
}

// Example 4: Navigation menu with permissions
function NavigationMenu() {
  const permissions = usePermissions();

  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      show: true, // Always show
    },
    {
      label: "Assets",
      href: "/assets",
      show: permissions.canViewAssets,
    },
    {
      label: "People",
      href: "/people",
      show: permissions.canViewUsers,
    },
    {
      label: "Reports",
      href: "/reports",
      show: permissions.canViewReports,
    },
    {
      label: "Admin",
      href: "/admin",
      show: permissions.isAdmin,
    },
  ];

  return (
    <nav>
      {menuItems
        .filter(item => item.show)
        .map(item => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))
      }
    </nav>
  );
}

// Example 5: Table actions with permissions
function AssetTableRow({ asset, onEdit, onDelete, onAssign }: any) {
  const permissions = usePermissions();

  return (
    <tr>
      <td>{asset.name}</td>
      <td>{asset.category}</td>
      <td>
        {/* Always show view button if user can view assets */}
        {permissions.canViewAssets && (
          <Button size="sm">View</Button>
        )}
        
        {/* Edit button with permission */}
        <AssetActions action="edit">
          <Button size="sm" onClick={() => onEdit(asset.id)}>
            Edit
          </Button>
        </AssetActions>
        
        {/* Delete button (admin only) */}
        <AdminOnly>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => onDelete(asset.id)}
          >
            Delete
          </Button>
        </AdminOnly>
        
        {/* Assign button */}
        <AssetActions action="assign">
          <Button size="sm" onClick={() => onAssign(asset.id)}>
            Assign
          </Button>
        </AssetActions>
      </td>
    </tr>
  );
}

// Example 6: Form with permission-based field visibility
function AssetForm() {
  const permissions = usePermissions();

  return (
    <form>
      {/* Basic fields - everyone can see */}
      <input placeholder="Asset Name" />
      <input placeholder="Description" />
      
      {/* Admin-only fields */}
      <AdminOnly>
        <input placeholder="Purchase Price" />
        <input placeholder="Vendor Information" />
      </AdminOnly>
      
      {/* Permission-based fields */}
      <PermissionGuard permission="assets.assign">
        <select>
          <option>Assign to User...</option>
        </select>
      </PermissionGuard>
      
      {/* Different submit buttons based on permissions */}
      <div>
        {permissions.canCreateAssets && (
          <Button type="submit">Create Asset</Button>
        )}
        
        {permissions.canEditAssets && (
          <Button type="submit">Update Asset</Button>
        )}
        
        {!permissions.canCreateAssets && !permissions.canEditAssets && (
          <p>You don't have permission to modify assets</p>
        )}
      </div>
    </form>
  );
}

// Example 7: Server-side permission checking (for API routes)
/*
// In your API route (e.g., /api/assets/route.ts)
import { auth } from "@clerk/nextjs/server";
import { hasPermission } from "@/lib/utils/permissions";

export async function POST(req: Request) {
  const { userId } = await auth();
  
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user role from database or Clerk metadata
  const userRole = await getUserRole(userId);
  
  if (!hasPermission(userRole, "assets.create")) {
    return Response.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  // Proceed with asset creation...
}
*/

export {
  MyComponent,
  AssetManagementPanel,
  DashboardWidget,
  NavigationMenu,
  AssetTableRow,
  AssetForm,
}; 