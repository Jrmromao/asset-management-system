// Permission system for asset management
// MVP: Simple 3-role system with future scalability

export type Permission = 
  // Asset permissions
  | "assets.view"
  | "assets.create" 
  | "assets.edit"
  | "assets.delete"
  | "assets.assign"
  | "assets.export"
  
  // User/People permissions
  | "users.view"
  | "users.invite"
  | "users.edit"
  | "users.delete"
  | "users.export"
  
  // Role permissions
  | "roles.view"
  | "roles.create"
  | "roles.edit"
  | "roles.delete"
  
  // Company/Admin permissions
  | "company.settings"
  | "company.billing"
  | "company.analytics"
  
  // Reports permissions
  | "reports.view"
  | "reports.create"
  | "reports.export"
  
  // Categories permissions
  | "categories.view"
  | "categories.create"
  | "categories.edit"
  | "categories.delete"
  
  // Audit logs
  | "audit.view"
  
  // Special permissions
  | "admin.all"; // Super admin access

export type RoleName = "Admin" | "User" | "Loanee";

// MVP Role Definitions - Simple but extensible
const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Admin: [
    "admin.all", // Admins get everything
  ],
  
  User: [
    // Assets
    "assets.view",
    "assets.create", 
    "assets.edit",
    "assets.assign",
    "assets.export",
    
    // Users (limited)
    "users.view",
    
    // Categories
    "categories.view",
    "categories.create",
    "categories.edit",
    
    // Reports (basic)
    "reports.view",
    "reports.export",
  ],
  
  Loanee: [
    // Very limited - just view assets assigned to them
    "assets.view", // Will be filtered to only their assigned assets
  ]
};

// Helper to check if user has specific permission
export function hasPermission(
  userRole: string | undefined, 
  permission: Permission
): boolean {
  if (!userRole) return false;
  
  const roleName = userRole as RoleName;
  const rolePermissions = ROLE_PERMISSIONS[roleName];
  
  if (!rolePermissions) return false;
  
  // Admin gets everything
  if (rolePermissions.includes("admin.all")) return true;
  
  // Check specific permission
  return rolePermissions.includes(permission);
}

// Helper to check multiple permissions (user needs ALL of them)
export function hasAllPermissions(
  userRole: string | undefined, 
  permissions: Permission[]
): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

// Helper to check if user has ANY of the permissions
export function hasAnyPermission(
  userRole: string | undefined, 
  permissions: Permission[]
): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

// Check if user is admin
export function isAdmin(userRole: string | undefined): boolean {
  return userRole === "Admin";
}

// Check if user can login (Loanees cannot login by default)
export function canLogin(userRole: string | undefined): boolean {
  return userRole === "Admin" || userRole === "User";
}

// Get all permissions for a role (useful for debugging/admin interface)
export function getRolePermissions(roleName: RoleName): Permission[] {
  return ROLE_PERMISSIONS[roleName] || [];
}

// Check if user can perform action on resource
export function canPerformAction(
  userRole: string | undefined,
  action: "view" | "create" | "edit" | "delete" | "assign" | "export",
  resource: "assets" | "users" | "roles" | "categories" | "reports" | "company" | "audit"
): boolean {
  const permission = `${resource}.${action}` as Permission;
  return hasPermission(userRole, permission);
}

// Future-proofing: Custom permission checker for enterprise features
export function hasCustomPermission(
  userRole: string | undefined,
  customPermissions: string[] | null | undefined,
  permission: Permission
): boolean {
  // For MVP, just use role-based permissions
  // Later, this will check custom permissions array
  if (customPermissions && Array.isArray(customPermissions)) {
    return customPermissions.includes(permission);
  }
  
  return hasPermission(userRole, permission);
}

// Permission groups for UI components
export const PERMISSION_GROUPS = {
  ASSET_MANAGEMENT: [
    "assets.view",
    "assets.create", 
    "assets.edit",
    "assets.delete",
    "assets.assign",
    "assets.export"
  ] as Permission[],
  
  USER_MANAGEMENT: [
    "users.view",
    "users.invite",
    "users.edit", 
    "users.delete",
    "users.export"
  ] as Permission[],
  
  ADMIN_FEATURES: [
    "company.settings",
    "company.billing",
    "roles.create",
    "roles.edit",
    "roles.delete",
    "audit.view"
  ] as Permission[],
  
  REPORTING: [
    "reports.view",
    "reports.create",
    "reports.export",
    "company.analytics"
  ] as Permission[]
} as const;

// Check if user has access to entire permission group
export function hasPermissionGroup(
  userRole: string | undefined,
  group: keyof typeof PERMISSION_GROUPS
): boolean {
  return hasAllPermissions(userRole, PERMISSION_GROUPS[group]);
} 