import OpenAI from "openai";
import { prisma } from "@/app/db";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to calculate CO2 emission for an asset
export async function calculateAssetCo2(
  assetName: string,
  manufacturer: string,
  model: string,
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const prompt = `
      You are an expert in Life Cycle Assessment (LCA), carbon footprint analysis, and GHG Protocol Scope 1/2/3 classification for electronic devices and IT assets.
      Your task is to provide an accurate and well-documented estimation of the carbon footprint (CO2e) with proper GHG scope classification.

      **Asset Details:**
      - **Type:** ${assetName}
      - **Manufacturer:** ${manufacturer}
      - **Model:** ${model}

      **Instructions:**
      1. **Calculate the total CO2e (in kg)** across the entire lifecycle of the asset
      2. **Break down by lifecycle stages**: Manufacturing, Transportation, Use Phase, End-of-Life
      3. **Classify emissions by GHG Protocol Scopes**:
         - **Scope 1**: Direct emissions (typically 0 for IT assets unless fuel-powered)
         - **Scope 2**: Indirect emissions from purchased electricity (use phase energy consumption)
         - **Scope 3**: All other indirect emissions (manufacturing, transport, end-of-life)
      4. **Determine the primary scope** for this asset type (usually Scope 3 for IT assets)
      5. **Provide specific Scope 3 categories** following GHG Protocol:
         - Category 1: Purchased goods and services (manufacturing)
         - Category 2: Capital goods (if applicable)
         - Category 4: Upstream transportation (shipping)
         - Category 11: Use of sold products (if applicable)
         - Category 12: End-of-life treatment
      6. **Include activity data** used for calculations (weight, power consumption, lifespan)
      7. **Provide confidence score** (0-1) and cite data sources

      **JSON Output Format:**
      {
        "totalCo2e": number,
        "units": "kgCO2e",
        "confidenceScore": number,
        "primaryScope": 1 | 2 | 3,
        "primaryScopeCategory": "string describing main category",
        "methodology": "Brief description of calculation methodology",
        "lifecycleBreakdown": {
          "manufacturing": number | "N/A",
          "transport": number | "N/A", 
          "use": number | "N/A",
          "endOfLife": number | "N/A"
        },
        "scopeBreakdown": {
          "scope1": {
            "total": number,
            "categories": {
              "stationaryCombustion": number,
              "mobileCombustion": number,
              "processEmissions": number,
              "fugitiveEmissions": number
            }
          },
          "scope2": {
            "total": number,
            "locationBased": number,
            "marketBased": number,
            "electricity": number,
            "heating": number,
            "cooling": number,
            "steam": number
          },
          "scope3": {
            "total": number,
            "categories": {
              "purchasedGoods": number,
              "capitalGoods": number,
              "fuelEnergyActivities": number,
              "upstreamTransport": number,
              "wasteGenerated": number,
              "businessTravel": number,
              "employeeCommuting": number,
              "upstreamAssets": number,
              "downstreamTransport": number,
              "processingProducts": number,
              "useOfProducts": number,
              "endOfLifeTreatment": number,
              "downstreamAssets": number,
              "franchises": number,
              "investments": number
            }
          }
        },
        "activityData": {
          "weight": number,
          "energyConsumption": number,
          "expectedLifespan": number,
          "transportDistance": number
        },
        "emissionFactors": [
          {
            "name": "Source name",
            "version": "2024",
            "url": "URL if available",
            "region": "Global/US/EU",
            "lastUpdated": "2024-01-01"
          }
        ],
        "sources": [
          { "name": "Source Name", "url": "Source URL or identifier" }
        ],
        "description": "Brief summary of the methodology and assumptions made."
      }

      **Example for MacBook Pro 14-inch:**
      {
        "totalCo2e": 384.2,
        "units": "kgCO2e",
        "confidenceScore": 0.94,
        "primaryScope": 3,
        "primaryScopeCategory": "Purchased goods and services (manufacturing)",
        "methodology": "Based on Apple's official LCA using process-based methodology with hybrid approach for upstream impacts",
        "lifecycleBreakdown": {
          "manufacturing": 270.8,
          "transport": 18.4,
          "use": 85.0,
          "endOfLife": 10.0
        },
        "scopeBreakdown": {
          "scope1": {
            "total": 0,
            "categories": {
              "stationaryCombustion": 0,
              "mobileCombustion": 0,
              "processEmissions": 0,
              "fugitiveEmissions": 0
            }
          },
          "scope2": {
            "total": 85.0,
            "locationBased": 85.0,
            "marketBased": 75.2,
            "electricity": 85.0,
            "heating": 0,
            "cooling": 0,
            "steam": 0
          },
          "scope3": {
            "total": 299.2,
            "categories": {
              "purchasedGoods": 270.8,
              "capitalGoods": 0,
              "fuelEnergyActivities": 0,
              "upstreamTransport": 18.4,
              "wasteGenerated": 0,
              "businessTravel": 0,
              "employeeCommuting": 0,
              "upstreamAssets": 0,
              "downstreamTransport": 0,
              "processingProducts": 0,
              "useOfProducts": 0,
              "endOfLifeTreatment": 10.0,
              "downstreamAssets": 0,
              "franchises": 0,
              "investments": 0
            }
          }
        },
        "activityData": {
          "weight": 1.6,
          "energyConsumption": 65,
          "expectedLifespan": 4,
          "transportDistance": 8000
        },
        "emissionFactors": [
          {
            "name": "IEA Electricity Grid Factors",
            "version": "2023",
            "url": "https://www.iea.org/data-and-statistics",
            "region": "Global",
            "lastUpdated": "2023-12-01"
          }
        ],
        "sources": [
          { "name": "Apple Product Environmental Report for MacBook Pro 14-inch", "url": "https://www.apple.com/environment/pdf/products/notebooks/14-inch_MacBook_Pro_PER_Oct2023.pdf" }
        ],
        "description": "Comprehensive LCA based on Apple's official environmental report with GHG Protocol scope classification. Manufacturing represents 70% of total emissions (Scope 3), use phase 22% (Scope 2), transport 5% (Scope 3)."
      }

      Now, provide the detailed JSON object for the requested asset with proper GHG scope classification.
      `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const jsonResponse = JSON.parse(
      response.choices[0].message.content || "{}",
    );
    console.log("\n\n\n\nOpenAI Response:", response);
    console.log("OpenAI Response:", JSON.stringify(jsonResponse, null, 2));

    return { success: true, data: jsonResponse };
  } catch (error: any) {
    console.error("Error calculating CO2 for asset with OpenAI:", error);
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
