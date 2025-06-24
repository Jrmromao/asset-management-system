import OpenAI from "openai";
import { prisma } from "@/app/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.DEEPSEEK_API_URL || undefined, // Support for DeepSeek
});

// Types for cost optimization
interface CostOptimizationAnalysis {
  totalPotentialSavings: number;
  recommendations: CostRecommendation[];
  riskAssessment: RiskAssessment;
  implementationPriority: ImplementationPlan[];
  complianceImpact: ComplianceAnalysis;
}

interface CostRecommendation {
  id: string;
  type: 'license' | 'accessory' | 'workflow';
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
  confidenceScore: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeToValue: number; // days
  affectedAssets: string[];
  actionItems: string[];
}

interface RiskAssessment {
  overall: 'low' | 'medium' | 'high';
  factors: RiskFactor[];
  mitigationStrategies: string[];
}

interface RiskFactor {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  likelihood: number;
}

interface ImplementationPlan {
  phase: number;
  title: string;
  duration: number;
  recommendations: string[];
  dependencies: string[];
  expectedSavings: number;
}

interface ComplianceAnalysis {
  impactLevel: 'none' | 'low' | 'medium' | 'high';
  affectedPolicies: string[];
  requiredApprovals: string[];
  complianceChecklist: string[];
}

/**
 * Analyze license utilization and generate cost optimization recommendations
 */
export async function analyzeLicenseCostOptimization(
  userId: string,
  timeframe: 'monthly' | 'quarterly' | 'yearly' = 'quarterly'
): Promise<{ success: boolean; data?: CostOptimizationAnalysis; error?: string }> {
  try {
    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return { success: false, error: 'User not associated with a company' };
    }

    // Fetch comprehensive license data
    const licenseData = await getLicenseAnalyticsData(user.companyId, timeframe);
    
    const prompt = `
    You are an expert IT Asset Management consultant specializing in software license optimization and cost reduction.
    Analyze the following license data and provide actionable cost optimization recommendations.

    **Company License Portfolio:**
    ${JSON.stringify(licenseData, null, 2)}

    **Analysis Requirements:**
    1. **Utilization Analysis**: Identify underutilized licenses
    2. **Redundancy Detection**: Find overlapping software capabilities
    3. **Right-sizing Opportunities**: Optimize license counts based on actual usage
    4. **Renewal Optimization**: Timing and negotiation strategies
    5. **Alternative Solutions**: Open-source or cheaper alternatives
    6. **Compliance Risk Assessment**: License compliance issues
    7. **Workflow Optimization**: Process improvements to reduce waste

    **Output JSON Format:**
    {
      "totalPotentialSavings": number,
      "recommendations": [
        {
          "id": "unique-id",
          "type": "license" | "accessory" | "workflow",
          "category": "consolidation" | "rightsizing" | "alternative" | "renewal" | "process",
          "title": "Clear recommendation title",
          "description": "Detailed explanation with specific actions",
          "potentialSavings": number,
          "confidenceScore": 85,
          "implementationEffort": "low" | "medium" | "high",
          "timeToValue": number_in_days,
          "affectedAssets": ["license-ids or asset-names"],
          "actionItems": ["specific steps to implement"]
        }
      ],
      "riskAssessment": {
        "overall": "low" | "medium" | "high",
        "factors": [
          {
            "category": "compliance" | "operational" | "financial" | "security",
            "severity": "low" | "medium" | "high",
            "description": "Risk description",
            "likelihood": 0.75
          }
        ],
        "mitigationStrategies": ["risk mitigation approaches"]
      },
      "implementationPriority": [
        {
          "phase": 1,
          "title": "Phase name",
          "duration": number_in_days,
          "recommendations": ["recommendation-ids"],
          "dependencies": ["prerequisite requirements"],
          "expectedSavings": number
        }
      ],
      "complianceImpact": {
        "impactLevel": "none" | "low" | "medium" | "high",
        "affectedPolicies": ["policy names"],
        "requiredApprovals": ["approval types needed"],
        "complianceChecklist": ["compliance verification steps"]
      }
    }

    Provide specific, actionable recommendations with realistic savings estimates and implementation guidance.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent recommendations
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Store the analysis for tracking and reporting
    await storeCostOptimizationAnalysis(user.companyId, analysis, 'license');
    
    return { success: true, data: analysis };
  } catch (error) {
    console.error('Error in license cost optimization analysis:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Analyze accessory inventory and generate cost optimization recommendations
 */
export async function analyzeAccessoryCostOptimization(
  userId: string,
  timeframe: 'monthly' | 'quarterly' | 'yearly' = 'quarterly'
): Promise<{ success: boolean; data?: CostOptimizationAnalysis; error?: string }> {
  try {
    // Get user's company ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!user?.companyId) {
      return { success: false, error: 'User not associated with a company' };
    }

    const accessoryData = await getAccessoryAnalyticsData(user.companyId);
    
    const prompt = `
    You are an expert in inventory management and procurement optimization.
    Analyze the following accessory inventory data and provide cost optimization recommendations.

    **Company Accessory Inventory:**
    ${JSON.stringify(accessoryData, null, 2)}

    **Analysis Focus:**
    1. **Inventory Optimization**: Reduce excess stock and carrying costs
    2. **Procurement Efficiency**: Better purchasing strategies
    3. **Utilization Improvement**: Maximize accessory usage
    4. **Lifecycle Management**: Optimize replacement cycles
    5. **Vendor Consolidation**: Reduce procurement complexity
    6. **Standardization**: Reduce variety and complexity
    7. **Demand Forecasting**: Predictive inventory planning

    **Cost Reduction Opportunities:**
    - **Excess Inventory**: Items with low turnover or overstocking
    - **Procurement Optimization**: Bulk purchasing, vendor negotiations
    - **Standardization**: Reduce SKU variety for economies of scale
    - **Lifecycle Extension**: Maintenance vs replacement decisions
    - **Sharing Economy**: Pool resources across departments
    - **Alternative Sourcing**: Cost-effective suppliers or refurbished options

    Use the same JSON format as the license analysis, but focus on accessory-specific optimizations.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    // Store the analysis for tracking and reporting
    await storeCostOptimizationAnalysis(user.companyId, analysis, 'accessory');
    
    return { success: true, data: analysis };
  } catch (error) {
    console.error('Error in accessory cost optimization analysis:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate 12/24/36-month cost forecasts with scenario planning
 */
export async function generateCostForecast(
  companyId: string,
  forecastPeriod: 12 | 24 | 36 = 12 // months
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const historicalData = await getHistoricalCostData(companyId);
    const currentTrends = await getCurrentTrends(companyId);
    
    const prompt = `
    You are a financial analyst specializing in IT cost forecasting and budget planning.
    Analyze historical spending patterns and current trends to generate accurate cost forecasts.

    **Historical Cost Data:**
    ${JSON.stringify(historicalData, null, 2)}

    **Current Market Trends:**
    ${JSON.stringify(currentTrends, null, 2)}

    **Forecast Requirements:**
    - Forecast period: ${forecastPeriod} months
    - Include best-case, worst-case, and most-likely scenarios
    - Factor in seasonal variations, market trends, and growth patterns
    - Identify major cost drivers and potential savings opportunities
    - Include confidence intervals and risk factors

    **Output JSON Format:**
    {
      "forecastPeriod": ${forecastPeriod},
      "scenarios": {
        "mostLikely": {
          "totalCost": number,
          "monthlyBreakdown": [{"month": 1, "cost": number, "breakdown": {}}],
          "confidenceLevel": 0.0-1.0
        },
        "bestCase": {"totalCost": number, "savings": number, "factors": []},
        "worstCase": {"totalCost": number, "increases": number, "factors": []}
      },
      "costDrivers": [
        {
          "category": "licenses" | "accessories" | "maintenance" | "personnel",
          "currentCost": number,
          "projectedCost": number,
          "trend": "increasing" | "decreasing" | "stable",
          "impactFactors": []
        }
      ],
      "recommendations": [
        {
          "type": "cost_control" | "investment" | "optimization",
          "description": "specific recommendation",
          "potentialImpact": number,
          "timeframe": "short" | "medium" | "long"
        }
      ],
      "riskFactors": [
        {
          "factor": "risk description",
          "probability": 0.0-1.0,
          "impact": "low" | "medium" | "high",
          "mitigation": "mitigation strategy"
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const forecast = JSON.parse(response.choices[0].message.content || '{}');
    
    // Store forecast for tracking
    await storeCostForecast(companyId, forecast, forecastPeriod);
    
    return { success: true, data: forecast };
  } catch (error) {
    console.error('Error generating cost forecast:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Generate vendor negotiation strategies based on usage patterns and market data
 */
export async function generateVendorNegotiationStrategy(
  companyId: string,
  vendorId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const vendorData = await getVendorAnalyticsData(companyId, vendorId);
    const marketBenchmarks = await getMarketBenchmarkData(vendorId);
    
    const prompt = `
    You are an expert procurement negotiator specializing in IT vendor relationships and contract optimization.
    Analyze vendor performance and market data to develop effective negotiation strategies.

    **Vendor Performance Data:**
    ${JSON.stringify(vendorData, null, 2)}

    **Market Benchmarks:**
    ${JSON.stringify(marketBenchmarks, null, 2)}

    **Negotiation Strategy Requirements:**
    1. **Leverage Analysis**: Identify negotiation leverage points
    2. **Market Position**: Compare pricing against market benchmarks
    3. **Usage Patterns**: Optimize based on actual consumption
    4. **Contract Terms**: Improve terms and conditions
    5. **Risk Mitigation**: Reduce vendor lock-in and dependencies
    6. **Value Engineering**: Alternative approaches and bundling options

    **Output JSON Format:**
    {
      "vendorProfile": {
        "name": "vendor name",
        "relationship": "strategic" | "operational" | "tactical",
        "leverage": "high" | "medium" | "low",
        "alternatives": number_of_alternatives
      },
      "negotiationStrategy": {
        "primaryObjectives": ["cost reduction", "better terms", "improved service"],
        "leveragePoints": ["specific leverage factors"],
        "concessionStrategy": ["what to offer in return"],
        "walkAwayAlternatives": ["backup options"]
      },
      "costOptimization": {
        "currentSpend": number,
        "targetSavings": number,
        "savingsOpportunities": [
          {
            "area": "pricing" | "terms" | "usage" | "bundling",
            "description": "specific opportunity",
            "potentialSavings": number,
            "feasibility": "high" | "medium" | "low"
          }
        ]
      },
      "contractRecommendations": {
        "termLength": "recommended duration",
        "pricingModel": "recommended model",
        "keyTerms": ["important contract terms"],
        "escapeClause": ["exit strategies"]
      },
      "marketIntelligence": {
        "competitivePosition": "above" | "at" | "below" market,
        "pricingGap": percentage,
        "marketTrends": ["relevant trends"],
        "benchmarkData": {"metric": "value"}
      },
      "actionPlan": [
        {
          "phase": number,
          "action": "specific action",
          "timeline": "timeframe",
          "owner": "responsible party",
          "expectedOutcome": "expected result"
        }
      ]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const strategy = JSON.parse(response.choices[0].message.content || '{}');
    
    return { success: true, data: strategy };
  } catch (error) {
    console.error('Error generating vendor negotiation strategy:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Helper functions to gather data for AI analysis

async function getLicenseAnalyticsData(companyId: string, timeframe: string) {
  const licenses = await prisma.license.findMany({
    where: { companyId },
    include: {
      Asset: {
        include: {
          user: true,
          statusLabel: true
        }
      },
      Manufacturer: true,
      statusLabel: true
    }
  });

  return {
    totalLicenses: licenses.length,
    licensesByType: licenses.reduce((acc, license) => {
      const type = license.name.split(' ')[0] || 'Unknown'; // Extract type from name
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    costBreakdown: {
      totalAnnualCost: licenses.reduce((sum, l) => sum + Number(l.annualPrice || 0), 0),
      totalMonthlyCost: licenses.reduce((sum, l) => sum + Number(l.monthlyPrice || 0), 0),
      averageCostPerLicense: licenses.length > 0 ? 
        licenses.reduce((sum, l) => sum + Number(l.annualPrice || 0), 0) / licenses.length : 0
    },
    utilizationData: licenses.map(license => ({
      id: license.id,
      name: license.name,
      type: license.name.split(' ')[0],
      totalSeats: license.seats || 1,
      assignedAssets: license.Asset.length,
      utilizationRate: license.seats ? (license.Asset.length / license.seats) * 100 : 100,
      annualCost: Number(license.annualPrice || 0),
      costPerSeat: license.seats && license.annualPrice ? 
        Number(license.annualPrice) / license.seats : Number(license.annualPrice || 0),
      renewalDate: license.renewalDate,
      vendor: license.Manufacturer?.name || 'Unknown',
      billingCycle: license.billingCycle,
      activeUsers: license.Asset.filter((asset: any) => asset.user).length
    })),
    complianceStatus: licenses.map(license => ({
      id: license.id,
      name: license.name,
      isCompliant: license.Asset.length <= (license.seats || 1),
      overallocation: Math.max(0, license.Asset.length - (license.seats || 1)),
      complianceRisk: license.Asset.length > (license.seats || 1) ? 'high' : 'low'
    }))
  };
}

async function getAccessoryAnalyticsData(companyId: string) {
  const accessories = await prisma.accessory.findMany({
    where: { companyId },
    include: {
      statusLabel: true,
      category: true,
      userItems: true
    }
  });

  return {
    totalAccessories: accessories.length,
    inventoryValue: accessories.reduce((sum, acc) => sum + Number(acc.totalValue || 0), 0),
    accessoriesByCategory: accessories.reduce((acc, accessory) => {
      const category = accessory.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    stockAnalysis: accessories.map(accessory => {
      const assignedQuantity = accessory.userItems.length;
      const availableQuantity = accessory.totalQuantityCount - assignedQuantity;
      
      return {
        id: accessory.id,
        name: accessory.name,
        category: accessory.category?.name || 'Uncategorized',
        totalQuantity: accessory.totalQuantityCount || 0,
        availableQuantity: availableQuantity,
        utilizationRate: accessory.totalQuantityCount ? 
          (assignedQuantity / accessory.totalQuantityCount) * 100 : 0,
        unitCost: Number(accessory.unitCost || 0),
        totalValue: Number(accessory.totalValue || 0),
        reorderLevel: accessory.reorderPoint || 0,
        needsReorder: availableQuantity <= (accessory.reorderPoint || 0),
        lastPurchasePrice: Number(accessory.lastPurchasePrice || 0),
        status: accessory.statusLabel?.name || 'Unknown'
      };
    }),
    costMetrics: {
      averageUnitCost: accessories.length > 0 ? 
        accessories.reduce((sum, acc) => sum + Number(acc.unitCost || 0), 0) / accessories.length : 0,
      totalCarryingCost: accessories.reduce((sum, acc) => {
        const assignedQuantity = acc.userItems.length;
        const availableQuantity = acc.totalQuantityCount - assignedQuantity;
        return sum + (Number(acc.unitCost || 0) * availableQuantity);
      }, 0),
      turnoverRate: accessories.length > 0 ? 
        accessories.filter(acc => {
          const assignedQuantity = acc.userItems.length;
          const availableQuantity = acc.totalQuantityCount - assignedQuantity;
          return availableQuantity < acc.totalQuantityCount;
        }).length / accessories.length : 0
    }
  };
}

async function getHistoricalCostData(companyId: string) {
  // This would typically pull from cost tracking tables
  // For now, return sample structure
  return {
    monthlySpend: [], // Last 12 months of spending data
    yearOverYearGrowth: 0,
    seasonalPatterns: {},
    majorCostEvents: []
  };
}

async function getCurrentTrends(companyId: string) {
  return {
    industryGrowthRate: 0.05,
    inflationRate: 0.03,
    marketTrends: ['cloud migration', 'remote work tools'],
    vendorPriceChanges: []
  };
}

async function getVendorAnalyticsData(companyId: string, vendorId: string) {
  return {
    vendorName: 'Sample Vendor',
    totalSpend: 0,
    contractTerms: {},
    performanceMetrics: {},
    relationshipHistory: []
  };
}

async function getMarketBenchmarkData(vendorId: string) {
  return {
    marketPosition: 'competitive',
    pricingBenchmarks: {},
    alternativeVendors: [],
    marketTrends: []
  };
}

async function storeCostOptimizationAnalysis(
  companyId: string, 
  analysis: CostOptimizationAnalysis, 
  type: 'license' | 'accessory'
) {
  try {
    // Store analysis results for tracking and historical comparison
    console.log(`Storing ${type} cost optimization analysis for company ${companyId}`);
    // Implementation would store in database table for tracking
  } catch (error) {
    console.error('Error storing cost optimization analysis:', error);
  }
}

async function storeCostForecast(
  companyId: string, 
  forecast: any, 
  period: number
) {
  try {
    console.log(`Storing cost forecast for company ${companyId}, period: ${period} months`);
    // Implementation would store forecast in database
  } catch (error) {
    console.error('Error storing cost forecast:', error);
  }
} 