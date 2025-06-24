import { NextRequest, NextResponse } from 'next/server';
import { analyzeLicenseCostOptimization, analyzeAccessoryCostOptimization } from '@/lib/services/ai-cost-optimization.service';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { analysisType, timeframe } = await request.json();

    if (!analysisType) {
      return NextResponse.json(
        { error: 'Analysis type is required' },
        { status: 400 }
      );
    }

    let result;
    
    switch (analysisType) {
      case 'license':
        result = await analyzeLicenseCostOptimization(userId, timeframe);
        break;
      case 'accessory':
        result = await analyzeAccessoryCostOptimization(userId, timeframe);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Cost optimization API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 