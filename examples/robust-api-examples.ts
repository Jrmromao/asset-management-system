// Examples of robust API protection using the permission system

import { NextRequest, NextResponse } from "next/server";
import { 
  verifyPermission, 
  verifyAdmin, 
  verifyAction,
  withPermission,
  requirePermission,
  verifyPermissionWithRateLimit 
} from "@/lib/utils/permissions-server";

// Example 1: Basic API route protection
export async function GET_assets(req: NextRequest) {
  // Always verify permissions on the server
  const verification = await verifyPermission("assets.view");
  
  if (!verification.success) {
    return NextResponse.json(
      { error: verification.error },
      { status: verification.error?.includes("Authentication") ? 401 : 403 }
    );
  }

  // User has permission, proceed with the request
  const assets = await getAssets();
  return NextResponse.json(assets);
}

// Example 2: Protected asset creation
export async function POST_assets(req: NextRequest) {
  const verification = await verifyPermission("assets.create");
  
  if (!verification.success) {
    return NextResponse.json(
      { error: verification.error },
      { status: 403 }
    );
  }

  const data = await req.json();
  
  // Additional validation
  if (!data.name || !data.category) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const asset = await createAsset(data, verification.userId!);
  return NextResponse.json(asset);
}

// Example 3: Admin-only endpoint
export async function DELETE_company_data(req: NextRequest) {
  const verification = await verifyAdmin();
  
  if (!verification.success) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  // This is a dangerous operation, log it
  console.log(`ADMIN_ACTION: ${verification.userId} deleted company data`);
  
  await deleteCompanyData();
  return NextResponse.json({ success: true });
}

// Example 4: Using middleware pattern
export const POST_users = withPermission("users.invite")(
  async (req: Request, { userRole, userId }) => {
    const data = await req.json();
    
    // We know the user has permission, proceed safely
    const result = await inviteUser(data, userId);
    
    return Response.json(result);
  }
);

// Example 5: Rate-limited sensitive operation
export async function DELETE_user(req: NextRequest) {
  // This uses rate limiting for sensitive operations
  const verification = await verifyPermissionWithRateLimit("users.delete", 5); // Max 5 deletions per minute
  
  if (!verification.success) {
    return NextResponse.json(
      { error: verification.error },
      { status: 403 }
    );
  }

  const { userId } = await req.json();
  await deleteUser(userId);
  
  return NextResponse.json({ success: true });
}

// Example 6: Protected server action
const createAssetAction = requirePermission("assets.create", async (data: any) => {
  // This function will only run if user has permission
  return await createAsset(data);
});

// Example 7: Multiple permission check
export async function POST_bulk_assign(req: NextRequest) {
  const verification = await verifyPermissions([
    "assets.assign",
    "users.view"
  ], true); // Requires BOTH permissions
  
  if (!verification.success) {
    return NextResponse.json(
      { error: verification.error },
      { status: 403 }
    );
  }

  const { assetIds, userId } = await req.json();
  await bulkAssignAssets(assetIds, userId);
  
  return NextResponse.json({ success: true });
}

// Example 8: Action-based permission check
export async function PUT_asset_category(req: NextRequest) {
  const verification = await verifyAction("edit", "categories");
  
  if (!verification.success) {
    return NextResponse.json(
      { error: verification.error },
      { status: 403 }
    );
  }

  const data = await req.json();
  const category = await updateCategory(data);
  
  return NextResponse.json(category);
}

// Example 9: Comprehensive protection with validation
export async function POST_invite_user(req: NextRequest) {
  try {
    // 1. Verify permission
    const verification = await verifyPermission("users.invite");
    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error },
        { status: 403 }
      );
    }

    // 2. Validate input
    const data = await req.json();
    if (!data.email || !data.roleId) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // 3. Business logic validation
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // 4. Execute the action
    const result = await inviteUser(data, verification.userId!);
    
    // 5. Audit log
    console.log(`USER_INVITED: ${verification.userId} invited ${data.email}`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Example 10: Resource-specific permission (future enhancement)
export async function GET_asset_details(req: NextRequest) {
  const verification = await verifyPermission("assets.view");
  
  if (!verification.success) {
    return NextResponse.json(
      { error: verification.error },
      { status: 403 }
    );
  }

  const assetId = req.nextUrl.searchParams.get("id");
  const asset = await getAsset(assetId!);
  
  // Future: Check if user can view THIS specific asset
  // if (!canViewAsset(verification.userId, assetId)) {
  //   return NextResponse.json({ error: "Cannot view this asset" }, { status: 403 });
  // }
  
  return NextResponse.json(asset);
}

// Helper functions (would be in separate files)
async function getAssets() {
  // Implementation
  return [];
}

async function createAsset(data: any, userId?: string) {
  // Implementation
  return { id: "123", ...data };
}

async function deleteCompanyData() {
  // Implementation
}

async function inviteUser(data: any, invitedBy: string) {
  // Implementation
  return { success: true };
}

async function deleteUser(userId: string) {
  // Implementation
}

async function bulkAssignAssets(assetIds: string[], userId: string) {
  // Implementation
}

async function updateCategory(data: any) {
  // Implementation
  return data;
}

async function findUserByEmail(email: string) {
  // Implementation
  return null;
}

async function getAsset(id: string) {
  // Implementation
  return { id, name: "Sample Asset" };
} 