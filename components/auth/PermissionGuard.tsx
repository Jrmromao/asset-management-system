import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Permission, PERMISSION_GROUPS } from "@/lib/utils/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;

  // Permission-based access
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // true = user needs ALL permissions, false = user needs ANY permission

  // Role-based access
  roles?: string[];
  adminOnly?: boolean;

  // Permission group access
  permissionGroup?: keyof typeof PERMISSION_GROUPS;

  // Action-based access (shorthand)
  action?: "view" | "create" | "edit" | "delete" | "assign" | "export";
  resource?:
    | "assets"
    | "users"
    | "roles"
    | "categories"
    | "reports"
    | "company"
    | "audit";

  // Fallback content when access is denied
  fallback?: React.ReactNode;

  // Loading state
  showLoadingFallback?: boolean;
  loadingFallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  requireAll = true,
  roles,
  adminOnly = false,
  permissionGroup,
  action,
  resource,
  fallback = null,
  showLoadingFallback = false,
  loadingFallback = null,
}: PermissionGuardProps) {
  const userPermissions = usePermissions();

  // Show loading fallback if specified and still loading
  if (showLoadingFallback && userPermissions.loading) {
    return <>{loadingFallback}</>;
  }

  // Check admin-only access
  if (adminOnly && !userPermissions.isAdmin) {
    return <>{fallback}</>;
  }

  // Check role-based access
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.includes(userPermissions.role || "");
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check single permission
  if (permission && !userPermissions.hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? userPermissions.hasAllPermissions(permissions)
      : userPermissions.hasAnyPermission(permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  // Check permission group
  if (permissionGroup && !userPermissions.hasPermissionGroup(permissionGroup)) {
    return <>{fallback}</>;
  }

  // Check action-based permission
  if (
    action &&
    resource &&
    !userPermissions.canPerformAction(action, resource)
  ) {
    return <>{fallback}</>;
  }

  // If all checks pass, render children
  return <>{children}</>;
}

// Convenience components for common use cases
export function AdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionGuard adminOnly fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function AssetActions({
  children,
  action,
  fallback,
}: {
  children: React.ReactNode;
  action: "view" | "create" | "edit" | "delete" | "assign" | "export";
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionGuard action={action} resource="assets" fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function UserActions({
  children,
  action,
  fallback,
}: {
  children: React.ReactNode;
  action: "view" | "invite" | "edit" | "delete" | "export";
  fallback?: React.ReactNode;
}) {
  return (
    <PermissionGuard
      permission={`users.${action}` as Permission}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

// Hook for conditional rendering in components
export function useConditionalRender() {
  const permissions = usePermissions();

  return {
    // Render content based on permission
    renderIf: (
      condition: boolean,
      content: React.ReactNode,
      fallback?: React.ReactNode,
    ) => {
      return condition ? content : fallback || null;
    },

    // Render content if user has permission
    renderIfPermission: (
      permission: Permission,
      content: React.ReactNode,
      fallback?: React.ReactNode,
    ) => {
      return permissions.hasPermission(permission) ? content : fallback || null;
    },

    // Render content if user is admin
    renderIfAdmin: (content: React.ReactNode, fallback?: React.ReactNode) => {
      return permissions.isAdmin ? content : fallback || null;
    },

    // Render content if user can perform action
    renderIfCanPerform: (
      action: "view" | "create" | "edit" | "delete" | "assign" | "export",
      resource:
        | "assets"
        | "users"
        | "roles"
        | "categories"
        | "reports"
        | "company"
        | "audit",
      content: React.ReactNode,
      fallback?: React.ReactNode,
    ) => {
      return permissions.canPerformAction(action, resource)
        ? content
        : fallback || null;
    },
  };
}
