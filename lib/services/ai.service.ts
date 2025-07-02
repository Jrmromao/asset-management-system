import OpenAI from "openai";
import { prisma } from "@/app/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Debug API key loading
console.log(
  "🔍 OpenAI API Key loaded:",
  process.env.OPENAI_API_KEY
    ? `${process.env.OPENAI_API_KEY.substring(0, 20)}...`
    : "NOT FOUND",
);

// Function to calculate CO2 emission for an asset
export async function calculateAssetCo2(
  assetType: string, // normalized type/category, e.g., 'laptop'
  manufacturer: string,
  model: string,
  options?: {
    category?: string;
    energyConsumption?: number;
    expectedLifespan?: number;
    dailyOperationHours?: number;
    weight?: number;
    yearOfManufacture?: number;
    transportDistance?: number;
    endOfLifePlan?: string;
    energyConsumptionKwhPerYear?: number;
  }
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Build up asset details dynamically
    const assetDetails: string[] = [];
    if (options?.category) assetDetails.push(`Category: ${options.category}`);
    if (assetType) assetDetails.push(`Type: ${assetType}`);
    if (manufacturer) assetDetails.push(`Manufacturer: ${manufacturer}`);
    if (model) assetDetails.push(`Model: ${model}`);

    // Energy consumption logic
    let annualKwh: number | undefined = undefined;
    if (options?.energyConsumptionKwhPerYear !== undefined) {
      annualKwh = options.energyConsumptionKwhPerYear;
      assetDetails.push(`Energy Consumption: ${annualKwh} kWh/year`);
    } else if (
      options?.energyConsumption !== undefined &&
      options?.dailyOperationHours !== undefined
    ) {
      // Estimate kWh/year from Watts and hours/day
      annualKwh = (options.energyConsumption * options.dailyOperationHours * 365) / 1000;
      assetDetails.push(`Energy Consumption: ${annualKwh.toFixed(1)} kWh/year (estimated from ${options.energyConsumption}W × ${options.dailyOperationHours}h/day)`);
    } else if (options?.energyConsumption !== undefined) {
      assetDetails.push(`Power Rating: ${options.energyConsumption} Watts`);
    } else {
      assetDetails.push(`Energy Consumption: (use typical/average for this type/model)`);
    }
    if (options?.expectedLifespan !== undefined) {
      assetDetails.push(`Expected Lifespan: ${options.expectedLifespan} years`);
    } else {
      assetDetails.push(`Expected Lifespan: (use typical/average for this type/model)`);
    }
    if (options?.dailyOperationHours !== undefined) {
      assetDetails.push(`Daily Operation Hours: ${options.dailyOperationHours} hours/day`);
    } else {
      assetDetails.push(`Daily Operation Hours: (use typical/average for this type/model)`);
    }
    if (options?.weight !== undefined) {
      assetDetails.push(`Weight: ${options.weight} kg`);
    } else {
      assetDetails.push(`Weight: (use typical/average for this type/model)`);
    }
    if (options?.yearOfManufacture !== undefined) {
      assetDetails.push(`Year of Manufacture: ${options.yearOfManufacture}`);
    } else {
      assetDetails.push(`Year of Manufacture: (use typical/average for this type/model)`);
    }
    if (options?.transportDistance !== undefined) {
      assetDetails.push(`Transport Distance: ${options.transportDistance} km`);
    } else {
      assetDetails.push(`Transport Distance: (use typical/average for this type/model)`);
    }
    if (options?.endOfLifePlan) {
      assetDetails.push(`End of Life Plan: ${options.endOfLifePlan}`);
    } else {
      assetDetails.push(`End of Life Plan: (use typical/average for this type/model)`);
    }

    const assetDetailsBlock = assetDetails.length > 0
      ? `**Asset Details:**\n${assetDetails.join("\n")}`
      : "";

    console.log("🔍 Calculating CO2 for:", {
      assetType,
      manufacturer,
      model,
      ...options,
    });

    // Log the full prompt for transparency
    const prompt = `
      You are an expert in Life Cycle Assessment (LCA), carbon footprint analysis, and GHG Protocol Scope 1/2/3 classification for electronic devices and IT assets.
      Your task is to provide an accurate and well-documented estimation of the carbon footprint (CO2e) with proper GHG Protocol classification for the following asset:
      
      Asset Details:
      ${assetDetails.join("\n      ")}
      
      Please provide:
      1. The total CO2e (in kg) for each lifecycle stage: manufacturing, transport, use phase, and end-of-life.
      2. The expected lifespan of the asset in years (or use a typical value if not provided).
      3. A clear breakdown of the CO2e for each stage, so that monthly and annual amortized values can be calculated for reporting purposes.
      
      If any value is missing, use a typical or average value for this asset type/model and clearly state your assumptions.
      
      Respond with a JSON object containing:
      - co2e_kg: Estimated total CO2e in kilograms (sum of all stages)
      - expected_lifespan_years: Number of years
      - breakdown: { manufacturing, transport, use, end_of_life }
      - scope: GHG Protocol scope (1, 2, or 3)
      - documentation: Brief explanation and sources used
    `;
    console.log("🔍 AI Prompt:", prompt);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.1,
      seed: 12345,
    });

    const jsonResponse = JSON.parse(
      response.choices[0].message.content || "{}",
    );

    // Normalize confidence score if it's > 1 (convert from percentage to decimal)
    if (jsonResponse.confidenceScore && jsonResponse.confidenceScore > 1) {
      jsonResponse.confidenceScore = jsonResponse.confidenceScore / 100;
    }

    // Ensure we have valid data
    if (!jsonResponse.totalCo2e || jsonResponse.totalCo2e === 0) {
      console.error("⚠️ OpenAI returned 0 or missing totalCo2e:", jsonResponse);
      return {
        success: false,
        error: "OpenAI returned invalid CO2e value (0 or missing)",
      };
    }

    return { success: true, data: jsonResponse };
  } catch (error: any) {
    console.error("❌ Error calculating CO2 for asset with OpenAI:", error);
    return { success: false, error: error.message };
  }
}

// Function to create a CO2 record in the database
export async function createCo2eRecord(
  assetId: string,
  co2eData: any,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const co2eRecord = await prisma.co2eRecord.create({
      data: {
        assetId,
        co2e: co2eData.totalCo2e, // Updated field
        units: co2eData.units,
        sourceOrActivity: co2eData.sources.map((s: any) => s.name).join(", "), // Join sources
        co2eType: "Lifecycle", // More descriptive type
        description: co2eData.description,
        itemType: "Asset", // Specify itemType
      },
    });
    return { success: true, data: co2eRecord };
  } catch (error: any) {
    console.error("Error creating CO2e record:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get AI-powered depreciation method recommendation and reasoning for an asset.
 * @param assetDetails - Object with asset fields (category, model, purchaseDate, etc.)
 * @param assetHistory - Array of asset history events (optional)
 * @returns { method: string, reasoning: string, confidence?: number, assumptions?: string, summaryTable?: any[] }
 */
export async function getDepreciationRecommendation(assetDetails: any, assetHistory: any[] = []): Promise<{ method: string; reasoning: string; confidence?: number; assumptions?: string; summaryTable?: any[] }> {
  const prompt = `
You are an expert in accounting, asset management, and financial reporting. Your job is to recommend the most appropriate depreciation method for a given asset, based on its details and usage history. Use all provided data, and be explicit about any uncertainty or missing information.

Asset Details:
${JSON.stringify(assetDetails, null, 2)}

Asset History (events, assignments, maintenance, etc.):
${assetHistory.length > 0 ? JSON.stringify(assetHistory.slice(0, 5), null, 2) : "No significant history."}

Please:
1. Recommend the best depreciation method for this asset. Choose one of: 'straightLine', 'decliningBalance', or 'doubleDecliningBalance'.
2. Consider industry standards, compliance, and tax implications for this asset type and region (if available).
3. Provide a plain-English explanation for your choice, including any assumptions made.
4. Give a confidence score (0-1) for your recommendation, and state any uncertainty.
5. Provide a summary table comparing all three methods for this asset, with columns: method, pros, cons, suitability (short text).
6. If possible, cite references or sources for your recommendation.

Respond in JSON with:
- method: the recommended method (string)
- reasoning: a plain-English explanation for your choice (string)
- confidence: number between 0 and 1 (optional)
- assumptions: any assumptions or caveats (string, optional)
- summaryTable: array of { method, pros, cons, suitability }
- references: (optional) array of strings
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
    seed: 12345,
  });

  const json = JSON.parse(response.choices[0].message.content || "{}" );
  return {
    method: json.method || "straightLine",
    reasoning: json.reasoning || "No reasoning provided by AI.",
    confidence: json.confidence,
    assumptions: json.assumptions,
    summaryTable: json.summaryTable,
  };
}
