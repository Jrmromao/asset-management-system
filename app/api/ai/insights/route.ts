import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateAssetInsights } from "@/lib/services/ai-analytics.service";
import { prisma } from "@/app/db";

export async function POST(request: NextRequest) {
  console.log("🤖 AI Insights API: Starting request processing");
  
  try {
    const { userId, orgId } = await auth();
    console.log("🔐 AI Insights API: Auth check completed", { userId: userId ? "✅" : "❌", orgId });
    
    if (!userId) {
      console.log("❌ AI Insights API: Unauthorized - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { analysisType = 'comprehensive' } = body;
    console.log("📊 AI Insights API: Request body parsed", { analysisType, body });

    // Try to find the user in our database first
    console.log("👤 AI Insights API: Looking up user in database");
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, email: true }
    });

    // If user doesn't exist in our database, try to find by email
    if (!user) {
      console.log("🔍 AI Insights API: User not found by ID, trying to find by email");
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
          console.log("📧 AI Insights API: User lookup by email", { found: !!user, email });
        }
      }
    }

    // If still no user found, use our seeded test user for development
    if (!user) {
      console.log("🧪 AI Insights API: No user found, using test user for development");
      const testUserId = "cmc80pcfb00088oa52sxacapd";
      const testCompanyId = "cmc80pcez00048oa5v3px063c";
      
      user = await prisma.user.findUnique({
        where: { id: testUserId },
        select: { id: true, companyId: true, email: true }
      });
      
      if (!user) {
        // Find or create a basic user role for the test company
        console.log("🔧 AI Insights API: Finding/creating user role");
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
        console.log("🔧 AI Insights API: Creating test user");
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

    console.log("✅ AI Insights API: User resolved", { 
      userId: user.id, 
      companyId: user.companyId,
      email: user.email 
    });

    if (!user.companyId) {
      console.log("❌ AI Insights API: User has no company association");
      return NextResponse.json({ 
        error: "User not associated with a company" 
      }, { status: 400 });
    }

    // Create analysis options object
    const analysisOptions = {
      analysisType: analysisType || 'comprehensive',
      includeUtilization: true,
      includeLifecycle: true,
      includeAnomalies: true
    };
    console.log("⚙️ AI Insights API: Analysis options", analysisOptions);

    console.log("🚀 AI Insights API: Calling generateAssetInsights service");
    const insights = await generateAssetInsights(user.id, analysisOptions);
    console.log("✅ AI Insights API: Service call completed", { 
      success: insights.success, 
      hasData: !!insights.data,
      error: insights.error 
    });
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error("💥 AI Insights API: Unexpected error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 