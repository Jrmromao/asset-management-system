import OpenAI from "openai";
import { prisma } from "@/app/db";

// Check environment variables
console.log("🔧 AI Analytics Service: Environment check", {
  hasOpenAIKey: !!process.env.OPENAI_API_KEY,
  hasDeepSeekURL: !!process.env.DEEPSEEK_API_URL,
  openAIKeyLength: process.env.OPENAI_API_KEY?.length || 0
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL || undefined, // Support for DeepSeek
});

// Types for AI analytics
interface AssetInsight {
  id: string;
  type: 'utilization' | 'lifecycle' | 'performance' | 'cost' | 'maintenance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  recommendation: string;
  affectedAssets: number;
  potentialSavings?: number;
  timeframe: string;
}

interface UtilizationMetric {
  category: string;
  utilized: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  value: number;
}

interface LifecyclePrediction {
  assetId: string;
  assetName: string;
  currentAge: number;
  predictedRemainingLife: number;
  replacementRecommendation: {
    timeframe: string;
    confidence: number;
    reasoning: string;
  };
}

interface AnomalyDetection {
  id: string;
  assetName: string;
  anomalyType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: string;
}

interface AIAnalyticsData {
  insights: AssetInsight[];
  utilization: UtilizationMetric[];
  lifecycle: LifecyclePrediction[];
  anomalies: AnomalyDetection[];
  summary: {
    totalAssets: number;
    activeAssets: number;
    utilizationRate: number;
    costOptimizationOpportunities: number;
    maintenanceAlerts: number;
  };
}

interface AnalysisOptions {
  analysisType: 'comprehensive' | 'utilization' | 'lifecycle' | 'anomalies';
  includeUtilization: boolean;
  includeLifecycle: boolean;
  includeAnomalies: boolean;
}

/**
 * Generate comprehensive AI-powered asset insights
 */
export async function generateAssetInsights(
  userId: string,
  options: AnalysisOptions
): Promise<{ success: boolean; data?: AIAnalyticsData; error?: string }> {
  console.log("🧠 AI Analytics Service: Starting generateAssetInsights", { userId, options });
  
  try {
    // Get user's company ID
    console.log("👤 AI Analytics Service: Looking up user company");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    console.log("🏢 AI Analytics Service: User lookup result", { 
      found: !!user, 
      companyId: user?.companyId 
    });

    if (!user?.companyId) {
      console.log("❌ AI Analytics Service: User not associated with company");
      return { success: false, error: 'User not associated with a company' };
    }

    // Gather comprehensive asset data
    console.log("📊 AI Analytics Service: Gathering comprehensive asset data");
    const assetData = await getComprehensiveAssetData(user.companyId);
    console.log("📈 AI Analytics Service: Asset data gathered", { 
      assetsCount: assetData.assets?.total || 0,
      licensesCount: assetData.licenses?.total || 0,
      accessoriesCount: assetData.accessories?.total || 0
    });
    
    const prompt = `
    You are an expert AI analyst specializing in IT asset management and operational optimization.
    Analyze the following comprehensive asset data and generate intelligent insights and recommendations.

    **Company Asset Portfolio:**
    ${JSON.stringify(assetData, null, 2)}

    **Analysis Requirements:**
    1. **Asset Utilization Analysis**: Identify usage patterns and optimization opportunities
    2. **Lifecycle Management**: Predict replacement needs and maintenance schedules
    3. **Cost Optimization**: Find areas to reduce costs and improve ROI
    4. **Performance Insights**: Analyze asset performance and efficiency
    5. **Risk Assessment**: Identify potential issues and compliance risks
    6. **Anomaly Detection**: Flag unusual patterns or outliers
    7. **Strategic Recommendations**: Provide actionable insights for improvement

    **Output JSON Format:**
    {
      "insights": [
        {
          "id": "insight-1",
          "type": "utilization" | "lifecycle" | "performance" | "cost" | "maintenance",
          "title": "Clear insight title",
          "description": "Detailed analysis and explanation",
          "severity": "low" | "medium" | "high",
          "impact": 1-10,
          "recommendation": "Specific actionable recommendation",
          "affectedAssets": number_of_assets,
          "potentialSavings": dollar_amount,
          "timeframe": "short-term" | "medium-term" | "long-term"
        }
      ],
      "utilization": [
        {
          "category": "Laptops" | "Desktops" | "Licenses" | "Accessories",
          "utilized": number_in_use,
          "total": total_number,
          "trend": "up" | "down" | "stable",
          "value": utilization_percentage
        }
      ],
      "lifecycle": [
        {
          "assetId": "asset-id",
          "assetName": "asset name",
          "currentAge": years,
          "predictedRemainingLife": years,
          "replacementRecommendation": {
            "timeframe": "6 months" | "1 year" | "2 years",
            "confidence": 85,
            "reasoning": "explanation for recommendation"
          }
        }
      ],
      "anomalies": [
        {
          "id": "anomaly-1",
          "assetName": "asset name",
          "anomalyType": "usage" | "cost" | "performance" | "compliance",
          "severity": "low" | "medium" | "high",
          "description": "Description of the anomaly",
          "detectedAt": "2024-01-01T00:00:00Z"
        }
      ],
      "summary": {
        "totalAssets": total_number,
        "activeAssets": active_number,
        "utilizationRate": overall_percentage,
        "costOptimizationOpportunities": number_of_opportunities,
        "maintenanceAlerts": number_of_alerts
      }
    }

    Focus on actionable insights that can drive real business value and operational improvements.
    `;

    console.log("🤖 AI Analytics Service: Calling OpenAI API");
    console.log("📝 AI Analytics Service: Prompt length", { promptLength: prompt.length });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    console.log("✅ AI Analytics Service: OpenAI response received", {
      model: response.model,
      usage: response.usage,
      hasContent: !!response.choices[0]?.message?.content
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    console.log("📊 AI Analytics Service: Analysis parsed", {
      insightsCount: analysis.insights?.length || 0,
      utilizationCount: analysis.utilization?.length || 0,
      lifecycleCount: analysis.lifecycle?.length || 0,
      anomaliesCount: analysis.anomalies?.length || 0
    });
    
    // Store the analysis for tracking
    console.log("💾 AI Analytics Service: Storing analysis");
    await storeAssetAnalysis(user.companyId, analysis);
    
    console.log("🎉 AI Analytics Service: Analysis completed successfully");
    return { success: true, data: analysis };
  } catch (error) {
    console.error('💥 AI Analytics Service: Error in asset insights generation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate predictive maintenance recommendations
 */
export async function generateMaintenanceInsights(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return { success: false, error: 'User not associated with a company' };
    }

    const maintenanceData = await getMaintenanceAnalyticsData(user.companyId);
    
    const prompt = `
    You are an expert in predictive maintenance and asset lifecycle management.
    Analyze the following maintenance data and provide intelligent recommendations.

    **Maintenance Data:**
    ${JSON.stringify(maintenanceData, null, 2)}

    **Analysis Focus:**
    1. **Predictive Maintenance**: Identify assets likely to need maintenance
    2. **Cost Optimization**: Optimize maintenance schedules and costs
    3. **Risk Assessment**: Identify high-risk assets and failure patterns
    4. **Resource Planning**: Optimize maintenance resource allocation
    5. **Performance Trends**: Analyze maintenance effectiveness

    **Output JSON Format:**
    {
      "maintenanceRecommendations": [
        {
          "assetId": "asset-id",
          "assetName": "asset name",
          "recommendationType": "preventive" | "corrective" | "replacement",
          "urgency": "low" | "medium" | "high" | "critical",
          "estimatedCost": dollar_amount,
          "reasoning": "detailed explanation",
          "scheduledDate": "recommended date",
          "riskIfDeferred": "risk description"
        }
      ],
      "costAnalysis": {
        "totalMaintenanceCost": dollar_amount,
        "preventiveCost": dollar_amount,
        "correctiveCost": dollar_amount,
        "potentialSavings": dollar_amount
      },
      "performanceMetrics": {
        "averageUptime": percentage,
        "maintenanceEfficiency": percentage,
        "costPerAsset": dollar_amount
      }
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return { success: true, data: analysis };
  } catch (error) {
    console.error('Error in maintenance insights generation:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Detect anomalies in asset usage patterns
 */
export async function detectAssetAnomalies(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return { success: false, error: 'User not associated with a company' };
    }

    const assetData = await getComprehensiveAssetData(user.companyId);
    
    const prompt = `
    You are an expert in anomaly detection for IT asset management.
    Analyze the following asset data and identify anomalies that could indicate:
    - Unusual usage patterns
    - Cost inefficiencies
    - Compliance issues
    - Performance problems

    **Asset Data:**
    ${JSON.stringify(assetData, null, 2)}

    **Output JSON Format:**
    {
      "anomalies": [
        {
          "id": "anomaly-1",
          "assetName": "asset name",
          "anomalyType": "usage" | "cost" | "performance" | "compliance",
          "severity": "low" | "medium" | "high",
          "description": "Description of the anomaly",
          "recommendation": "Recommended action",
          "detectedAt": "2024-01-01T00:00:00Z"
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return { success: true, data: analysis };
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper functions to gather data for AI analysis

async function getComprehensiveAssetData(companyId: string) {
  // Get all assets with comprehensive relations
  const assets = await prisma.asset.findMany({
    where: { companyId },
    include: {
      user: true,
      statusLabel: true,
      category: true,
      supplier: true,
      model: {
        include: {
          manufacturer: true
        }
      },
      department: true,
      values: true
    }
  });

  // Get licenses data
  const licenses = await prisma.license.findMany({
    where: { companyId },
    include: {
      Asset: true,
      Manufacturer: true,
      statusLabel: true
    }
  });

  // Get accessories data
  const accessories = await prisma.accessory.findMany({
    where: { companyId },
    include: {
      statusLabel: true,
      category: true,
      userItems: true
    }
  });

  // Get maintenance data
  const maintenance = await prisma.maintenance.findMany({
    where: { 
      asset: {
        companyId: companyId
      }
    },
    include: {
      asset: true,
      statusLabel: true,
      supplier: true,
      technician: true
    }
  });

  const currentDate = new Date();
  
  return {
    assets: {
      total: assets.length,
      active: assets.filter(a => a.statusLabel?.name !== 'Disposed').length,
      byCategory: assets.reduce((acc, asset) => {
        const category = asset.category?.name || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byStatus: assets.reduce((acc, asset) => {
        const status = asset.statusLabel?.name || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      assigned: assets.filter(a => a.user).length,
      unassigned: assets.filter(a => !a.user).length,
      ageDistribution: assets.map(asset => ({
        id: asset.id,
        name: asset.name,
        ageInYears: asset.purchaseDate ? 
          (currentDate.getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365) : 0,
        category: asset.category?.name,
        status: asset.statusLabel?.name,
        value: Number(asset.purchasePrice || 0)
      })),
      costAnalysis: {
        totalValue: assets.reduce((sum, a) => sum + Number(a.purchasePrice || 0), 0),
        averageValue: assets.length > 0 ? 
          assets.reduce((sum, a) => sum + Number(a.purchasePrice || 0), 0) / assets.length : 0,
        highValueAssets: assets.filter(a => Number(a.purchasePrice || 0) > 1000).length
      }
    },
    licenses: {
      total: licenses.length,
      totalSeats: licenses.reduce((sum, l) => sum + (l.seats || 0), 0),
      assignedSeats: licenses.reduce((sum, l) => sum + l.Asset.length, 0),
      utilizationRate: licenses.length > 0 ? 
        (licenses.reduce((sum, l) => sum + l.Asset.length, 0) / 
         licenses.reduce((sum, l) => sum + (l.seats || 0), 0)) * 100 : 0,
      annualCost: licenses.reduce((sum, l) => sum + Number(l.annualPrice || 0), 0),
      renewalsNext90Days: licenses.filter(l => 
        l.renewalDate && 
        l.renewalDate <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      ).length,
      underutilized: licenses.filter(l => {
        const utilization = l.seats ? l.Asset.length / l.seats : 0;
        return utilization < 0.7;
      }).length
    },
    accessories: {
      total: accessories.length,
      totalValue: accessories.reduce((sum, a) => sum + Number(a.totalValue || 0), 0),
      totalQuantity: accessories.reduce((sum, a) => sum + a.totalQuantityCount, 0),
      assignedQuantity: accessories.reduce((sum, a) => sum + a.userItems.length, 0),
      utilizationRate: accessories.reduce((sum, a) => sum + a.totalQuantityCount, 0) > 0 ?
        (accessories.reduce((sum, a) => sum + a.userItems.length, 0) / 
         accessories.reduce((sum, a) => sum + a.totalQuantityCount, 0)) * 100 : 0,
      needReorder: accessories.filter(a => 
        (a.totalQuantityCount - a.userItems.length) <= a.reorderPoint
      ).length
    },
    maintenance: {
      total: maintenance.length,
      completed: maintenance.filter(m => m.completionDate !== null).length,
      pending: maintenance.filter(m => m.completionDate === null).length,
      overdue: maintenance.filter(m => 
        m.startDate < currentDate && m.completionDate === null
      ).length,
      totalCost: maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0),
      averageCost: maintenance.length > 0 ?
        maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0) / maintenance.length : 0
    },
    trends: {
      assetGrowth: 0, // Could calculate from historical data
      costTrends: 0,  // Could calculate from historical data
      utilizationTrends: 0 // Could calculate from historical data
    }
  };
}

async function getMaintenanceAnalyticsData(companyId: string) {
  const maintenance = await prisma.maintenance.findMany({
    where: { 
      asset: {
        companyId: companyId
      }
    },
    include: {
      asset: {
        include: {
          category: true,
          statusLabel: true
        }
      },
      statusLabel: true,
      supplier: true,
      technician: true
    }
  });

  const currentDate = new Date();
  
  return {
    totalMaintenanceRecords: maintenance.length,
    byStatus: maintenance.reduce((acc, m) => {
      const status = m.statusLabel?.name || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byWarranty: maintenance.reduce((acc, m) => {
      const type = m.isWarranty ? 'Warranty' : 'Non-Warranty';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    costAnalysis: {
      totalCost: maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0),
      averageCost: maintenance.length > 0 ?
        maintenance.reduce((sum, m) => sum + Number(m.cost || 0), 0) / maintenance.length : 0,
      costByCategory: maintenance.reduce((acc, m) => {
        const category = m.asset.category?.name || 'Unknown';
        acc[category] = (acc[category] || 0) + Number(m.cost || 0);
        return acc;
      }, {} as Record<string, number>)
    },
    scheduleAnalysis: {
      upcoming: maintenance.filter(m => 
        m.startDate > currentDate
      ).length,
      overdue: maintenance.filter(m => 
        m.startDate < currentDate && m.completionDate === null
      ).length,
      completed: maintenance.filter(m => 
        m.completionDate !== null
      ).length
    },
    assetHealth: maintenance.map(m => ({
      assetId: m.asset.id,
      assetName: m.asset.name,
      category: m.asset.category?.name,
      maintenanceFrequency: 1, // Could calculate based on historical data
      lastMaintenanceDate: m.completionDate,
      nextScheduledDate: m.startDate,
      totalMaintenanceCost: Number(m.cost || 0),
      riskLevel: m.startDate < currentDate && m.completionDate === null ? 'high' : 'low'
    }))
  };
}

async function storeAssetAnalysis(companyId: string, analysis: any) {
  try {
    console.log(`Storing asset analysis for company ${companyId}`);
    // Implementation would store in database table for tracking
  } catch (error) {
    console.error('Error storing asset analysis:', error);
  }
} 