import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeLicenseCostOptimization, analyzeAccessoryCostOptimization } from "@/lib/services/ai-cost-optimization.service";
import { prisma } from "@/app/db";

export async function POST(request: NextRequest) {
  console.log("💰 Cost Optimization API: Starting request processing");
  
  try {
    const { userId, orgId } = await auth();
    console.log("🔐 Cost Optimization API: Auth check completed", { userId: userId ? "✅" : "❌", orgId });
    
    if (!userId) {
      console.log("❌ Cost Optimization API: Unauthorized - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { analysisType, timeframe = 'quarterly' } = body;
    console.log("📊 Cost Optimization API: Request body parsed", { analysisType, timeframe, body });

    if (!analysisType || !['license', 'accessory'].includes(analysisType)) {
      console.log("❌ Cost Optimization API: Invalid analysis type", { analysisType });
      return NextResponse.json({ 
        error: "Analysis type must be 'license' or 'accessory'" 
      }, { status: 400 });
    }

    // Try to find the user in our database first
    console.log("👤 Cost Optimization API: Looking up user in database");
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, email: true }
    });

    // If user doesn't exist in our database, try to find by email
    if (!user) {
      console.log("🔍 Cost Optimization API: User not found by ID, trying to find by email");
      const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      });
      
      if (clerkUser.ok) {
        const clerkUserData = await clerkUser.json();
        const email = clerkUserData.email_addresses?.[0]?.email_address;
        
        if (email) {
          user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, companyId: true, email: true }
          });
          console.log("📧 Cost Optimization API: User lookup by email", { found: !!user, email });
        }
      }
    }

    // If still no user found, use our seeded test user for development
    if (!user) {
      console.log("🧪 Cost Optimization API: No user found, using test user for development");
      const testUserId = "cmc80pcfb00088oa52sxacapd";
      const testCompanyId = "cmc80pcez00048oa5v3px063c";
      
      user = await prisma.user.findUnique({
        where: { id: testUserId },
        select: { id: true, companyId: true, email: true }
      });
      
      if (!user) {
        // Find or create a basic user role for the test company
        console.log("🔧 Cost Optimization API: Finding/creating user role");
        let userRole = await prisma.role.findFirst({
          where: {
            companyId: testCompanyId,
            name: "User"
          }
        });

        if (!userRole) {
          userRole = await prisma.role.create({
            data: {
              name: "User",
              companyId: testCompanyId,
              isDefault: true
            }
          });
        }

        // Create the test user if it doesn't exist
        console.log("🔧 Cost Optimization API: Creating test user");
        user = await prisma.user.create({
          data: {
            id: testUserId,
            email: "test@example.com",
            companyId: testCompanyId,
            firstName: "Test",
            lastName: "User",
            name: "Test User",
            roleId: userRole.id
          },
          select: { id: true, companyId: true, email: true }
        });
      }
    }

    console.log("✅ Cost Optimization API: User resolved", { 
      userId: user.id, 
      companyId: user.companyId,
      email: user.email 
    });

    if (!user.companyId) {
      console.log("❌ Cost Optimization API: User has no company association");
      return NextResponse.json({ 
        error: "User not associated with a company" 
      }, { status: 400 });
    }

    // Call the appropriate analysis function
    console.log("🚀 Cost Optimization API: Starting analysis", { type: analysisType });
    let result;
    
    if (analysisType === 'license') {
      console.log("📄 Cost Optimization API: Analyzing license costs");
      result = await analyzeLicenseCostOptimization(user.id, timeframe);
    } else {
      console.log("🔌 Cost Optimization API: Analyzing accessory costs");
      result = await analyzeAccessoryCostOptimization(user.id, timeframe);
    }

    console.log("✅ Cost Optimization API: Service call completed", { 
      success: result.success, 
      hasData: !!result.data,
      error: result.error 
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Cost Optimization API: Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 