// Server-side permission utilities for robust security
// This ensures permissions are validated on the server, not just client

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/app/db";
import { hasPermission, type Permission, type RoleName } from "./permissions";

/**
 * Server-side permission checking - CRITICAL for security
 * Never trust client-side permission checks alone
 */

export interface ServerPermissionResult {
  success: boolean;
  error?: string;
  userRole?: string;
  userId?: string;
}

/**
 * Get user role from database (server-side only)
 * This is the source of truth for permissions
 */
export async function getUserRoleFromDB(userId: string): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { oauthId: userId },
      select: {
        role: {
          select: { name: true }
        }
      }
    });

    return user?.role?.name || null;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Verify user has permission (server-side)
 * Use this in API routes and server actions
 */
export async function verifyPermission(permission: Permission): Promise<ServerPermissionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const userRole = await getUserRoleFromDB(userId);

    if (!userRole) {
      return {
        success: false,
        error: "User role not found",
        userId
      };
    }

    const hasAccess = hasPermission(userRole, permission);

    if (!hasAccess) {
      return {
        success: false,
        error: `Insufficient permissions. Required: ${permission}`,
        userRole,
        userId
      };
    }

    return {
      success: true,
      userRole,
      userId
    };
  } catch (error) {
    console.error("Permission verification error:", error);
    return {
      success: false,
      error: "Permission verification failed"
    };
  }
}

/**
 * Verify user has multiple permissions
 */
export async function verifyPermissions(
  permissions: Permission[], 
  requireAll: boolean = true
): Promise<ServerPermissionResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const userRole = await getUserRoleFromDB(userId);

    if (!userRole) {
      return {
        success: false,
        error: "User role not found",
        userId
      };
    }

    const permissionChecks = permissions.map(permission => 
      hasPermission(userRole, permission)
    );

    const hasAccess = requireAll 
      ? permissionChecks.every(check => check)
      : permissionChecks.some(check => check);

    if (!hasAccess) {
      const operator = requireAll ? "ALL" : "ANY";
      return {
        success: false,
        error: `Insufficient permissions. Required ${operator} of: ${permissions.join(", ")}`,
        userRole,
        userId
      };
    }

    return {
      success: true,
      userRole,
      userId
    };
  } catch (error) {
    console.error("Permission verification error:", error);
    return {
      success: false,
      error: "Permission verification failed"
    };
  }
}

/**
 * Verify user is admin (server-side)
 */
export async function verifyAdmin(): Promise<ServerPermissionResult> {
  return verifyPermission("admin.all");
}

/**
 * Verify user can perform action on resource
 */
export async function verifyAction(
  action: "view" | "create" | "edit" | "delete" | "assign" | "export",
  resource: "assets" | "users" | "roles" | "categories" | "reports" | "company" | "audit"
): Promise<ServerPermissionResult> {
  const permission = `${resource}.${action}` as Permission;
  return verifyPermission(permission);
}

/**
 * Get current user with role (server-side)
 * Useful for server components and API routes
 */
export async function getCurrentUserWithRole() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { oauthId: userId },
      include: {
        role: true,
        company: true
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Middleware helper for protecting API routes
 */
export function withPermission(permission: Permission) {
  return async function permissionMiddleware(
    handler: (req: Request, context: { userRole: string; userId: string }) => Promise<Response>
  ) {
    return async function protectedHandler(req: Request): Promise<Response> {
      const verification = await verifyPermission(permission);

      if (!verification.success) {
        return Response.json(
          { error: verification.error },
          { status: verification.error?.includes("Authentication") ? 401 : 403 }
        );
      }

      return handler(req, {
        userRole: verification.userRole!,
        userId: verification.userId!
      });
    };
  };
}

/**
 * HOC for protecting server actions
 */
export function requirePermission<T extends any[], R>(
  permission: Permission,
  action: (...args: T) => Promise<R>
) {
  return async function protectedAction(...args: T): Promise<R> {
    const verification = await verifyPermission(permission);

    if (!verification.success) {
      throw new Error(verification.error || "Permission denied");
    }

    return action(...args);
  };
}

/**
 * Audit logging for permission checks
 * Important for compliance and security monitoring
 */
export async function logPermissionCheck(
  permission: Permission,
  granted: boolean,
  userId?: string,
  context?: string
) {
  try {
    // In production, you might want to log to a dedicated audit service
    console.log("PERMISSION_AUDIT", {
      timestamp: new Date().toISOString(),
      permission,
      granted,
      userId,
      context,
      ip: "TODO: get IP from request"
    });

    // Optionally store in database for compliance
    // await prisma.auditLog.create({
    //   data: {
    //     action: "PERMISSION_CHECK",
    //     details: { permission, granted, context },
    //     userId,
    //     timestamp: new Date()
    //   }
    // });
  } catch (error) {
    console.error("Audit logging failed:", error);
  }
}

/**
 * Rate limiting for sensitive permissions
 * Prevents abuse of admin functions
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function checkRateLimit(
  userId: string,
  permission: Permission,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): Promise<boolean> {
  const key = `${userId}:${permission}`;
  const now = Date.now();
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (current.count >= maxAttempts) {
    await logPermissionCheck(permission, false, userId, "RATE_LIMITED");
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Enhanced permission verification with rate limiting
 */
export async function verifyPermissionWithRateLimit(
  permission: Permission,
  maxAttempts?: number
): Promise<ServerPermissionResult> {
  const verification = await verifyPermission(permission);
  
  if (!verification.success) {
    return verification;
  }

  // Apply rate limiting for sensitive operations
  const sensitivePermissions: Permission[] = [
    "users.delete",
    "assets.delete", 
    "company.settings",
    "roles.delete"
  ];

  if (sensitivePermissions.includes(permission)) {
    const rateLimitPassed = await checkRateLimit(
      verification.userId!,
      permission,
      maxAttempts
    );

    if (!rateLimitPassed) {
      return {
        success: false,
        error: "Rate limit exceeded for sensitive operation",
        userId: verification.userId
      };
    }
  }

  // Log successful permission check
  await logPermissionCheck(permission, true, verification.userId, "API_ACCESS");

  return verification;
} 