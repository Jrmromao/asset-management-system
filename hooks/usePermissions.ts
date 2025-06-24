import { useUser } from "@clerk/nextjs";
import { 
  hasPermission, 
  hasAllPermissions, 
  hasAnyPermission, 
  isAdmin, 
  canLogin,
  canPerformAction,
  hasPermissionGroup,
  getRolePermissions,
  type Permission,
  type RoleName,
  PERMISSION_GROUPS
} from "@/lib/utils/permissions";

export interface UserPermissions {
  // Basic permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  
  // Role checks
  isAdmin: boolean;
  canLogin: boolean;
  role: string | undefined;
  
  // Action-based checks
  canPerformAction: (
    action: "view" | "create" | "edit" | "delete" | "assign" | "export",
    resource: "assets" | "users" | "roles" | "categories" | "reports" | "company" | "audit"
  ) => boolean;
  
  // Group checks
  hasPermissionGroup: (group: keyof typeof PERMISSION_GROUPS) => boolean;
  
  // Asset-specific permissions (most common use case)
  canViewAssets: boolean;
  canCreateAssets: boolean;
  canEditAssets: boolean;
  canDeleteAssets: boolean;
  canAssignAssets: boolean;
  canExportAssets: boolean;
  
  // User management permissions
  canViewUsers: boolean;
  canInviteUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canExportUsers: boolean;
  
  // Admin permissions
  canManageCompany: boolean;
  canManageRoles: boolean;
  canViewAuditLogs: boolean;
  canViewReports: boolean;
  
  // Utility
  getAllPermissions: () => Permission[];
  loading: boolean;
}

export function usePermissions(): UserPermissions {
  const { user, isLoaded } = useUser();
  
  // Get user role from public metadata (you might need to adjust this based on your setup)
  const userRole = user?.publicMetadata?.role as string | undefined;
  
  // Create permission checker functions
  const checkPermission = (permission: Permission) => hasPermission(userRole, permission);
  const checkAllPermissions = (permissions: Permission[]) => hasAllPermissions(userRole, permissions);
  const checkAnyPermission = (permissions: Permission[]) => hasAnyPermission(userRole, permissions);
  const checkCanPerformAction = (
    action: "view" | "create" | "edit" | "delete" | "assign" | "export",
    resource: "assets" | "users" | "roles" | "categories" | "reports" | "company" | "audit"
  ) => canPerformAction(userRole, action, resource);
  const checkPermissionGroup = (group: keyof typeof PERMISSION_GROUPS) => hasPermissionGroup(userRole, group);
  
  return {
    // Basic permission checks
    hasPermission: checkPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission: checkAnyPermission,
    
    // Role checks
    isAdmin: isAdmin(userRole),
    canLogin: canLogin(userRole),
    role: userRole,
    
    // Action-based checks
    canPerformAction: checkCanPerformAction,
    
    // Group checks
    hasPermissionGroup: checkPermissionGroup,
    
    // Asset-specific permissions (most common)
    canViewAssets: checkPermission("assets.view"),
    canCreateAssets: checkPermission("assets.create"),
    canEditAssets: checkPermission("assets.edit"),
    canDeleteAssets: checkPermission("assets.delete"),
    canAssignAssets: checkPermission("assets.assign"),
    canExportAssets: checkPermission("assets.export"),
    
    // User management permissions
    canViewUsers: checkPermission("users.view"),
    canInviteUsers: checkPermission("users.invite"),
    canEditUsers: checkPermission("users.edit"),
    canDeleteUsers: checkPermission("users.delete"),
    canExportUsers: checkPermission("users.export"),
    
    // Admin permissions
    canManageCompany: checkPermission("company.settings"),
    canManageRoles: checkAnyPermission(["roles.create", "roles.edit", "roles.delete"]),
    canViewAuditLogs: checkPermission("audit.view"),
    canViewReports: checkPermission("reports.view"),
    
    // Utility
    getAllPermissions: () => userRole ? getRolePermissions(userRole as RoleName) : [],
    loading: !isLoaded,
  };
}

// Alternative hook that works with database user object (for server-side or when you have user from DB)
export function usePermissionsWithUser(dbUser: { role?: { name: string } } | null | undefined): Omit<UserPermissions, 'loading'> {
  const userRole = dbUser?.role?.name;
  
  // Create permission checker functions
  const checkPermission = (permission: Permission) => hasPermission(userRole, permission);
  const checkAllPermissions = (permissions: Permission[]) => hasAllPermissions(userRole, permissions);
  const checkAnyPermission = (permissions: Permission[]) => hasAnyPermission(userRole, permissions);
  const checkCanPerformAction = (
    action: "view" | "create" | "edit" | "delete" | "assign" | "export",
    resource: "assets" | "users" | "roles" | "categories" | "reports" | "company" | "audit"
  ) => canPerformAction(userRole, action, resource);
  const checkPermissionGroup = (group: keyof typeof PERMISSION_GROUPS) => hasPermissionGroup(userRole, group);
  
  return {
    // Basic permission checks
    hasPermission: checkPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission: checkAnyPermission,
    
    // Role checks
    isAdmin: isAdmin(userRole),
    canLogin: canLogin(userRole),
    role: userRole,
    
    // Action-based checks
    canPerformAction: checkCanPerformAction,
    
    // Group checks
    hasPermissionGroup: checkPermissionGroup,
    
    // Asset-specific permissions (most common)
    canViewAssets: checkPermission("assets.view"),
    canCreateAssets: checkPermission("assets.create"),
    canEditAssets: checkPermission("assets.edit"),
    canDeleteAssets: checkPermission("assets.delete"),
    canAssignAssets: checkPermission("assets.assign"),
    canExportAssets: checkPermission("assets.export"),
    
    // User management permissions
    canViewUsers: checkPermission("users.view"),
    canInviteUsers: checkPermission("users.invite"),
    canEditUsers: checkPermission("users.edit"),
    canDeleteUsers: checkPermission("users.delete"),
    canExportUsers: checkPermission("users.export"),
    
    // Admin permissions
    canManageCompany: checkPermission("company.settings"),
    canManageRoles: checkAnyPermission(["roles.create", "roles.edit", "roles.delete"]),
    canViewAuditLogs: checkPermission("audit.view"),
    canViewReports: checkPermission("reports.view"),
    
    // Utility
    getAllPermissions: () => userRole ? getRolePermissions(userRole as RoleName) : [],
  };
} 