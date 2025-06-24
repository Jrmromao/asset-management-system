import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/app/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return NextResponse.json({ 
        error: "User not associated with a company" 
      }, { status: 400 });
    }

    // Get recent cost optimization analyses
    const analyses = await prisma.costOptimizationAnalysis.findMany({
      where: { companyId: user.companyId },
      include: {
        recommendations: {
          orderBy: { priority: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Last 10 analyses
    });

    return NextResponse.json({ 
      success: true, 
      data: analyses 
    });
  } catch (error) {
    console.error("Error fetching cost optimization history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 