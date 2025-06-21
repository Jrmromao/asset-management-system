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
      You are an expert in Life Cycle Assessment (LCA) and carbon footprint analysis for electronic devices.
      Your task is to provide an accurate and well-documented estimation of the carbon footprint (CO2e) for the following asset.

      **Asset Details:**
      - **Type:** ${assetName}
      - **Manufacturer:** ${manufacturer}
      - **Model:** ${model}

      **Instructions:**
      1.  **Calculate the total CO2e (in kg)** across the entire lifecycle of the asset. If specific data for the model is not available, use data from a comparable model from the same manufacturer or a well-documented industry average.
      2.  **Break down the CO2e** by the following lifecycle stages if possible:
          *   Manufacturing (including raw material extraction)
          *   Transportation/Distribution
          *   Use Phase (based on an estimated average lifespan and energy consumption)
          *   End-of-Life (disposal/recycling)
      3.  **Provide a confidence score** (from 0 to 1) for your estimation, where 1 is very high confidence.
      4.  **Cite the primary data sources** you used for the estimation (e.g., manufacturer's sustainability reports, academic LCA studies, reputable databases like Ecoinvent).
      5.  **Return the response as a single, minified JSON object** with no markdown formatting.

      **JSON Output Format:**
      {
        "totalCo2e": number,
        "units": "kgCO2e",
        "confidenceScore": number,
        "lifecycleBreakdown": {
          "manufacturing": number | "N/A",
          "transport": number | "N/A",
          "use": number | "N/A",
          "endOfLife": number | "N/A"
        },
        "sources": [
          { "name": "Source Name", "url": "Source URL or identifier" }
        ],
        "description": "Brief summary of the methodology and assumptions made."
      }

      **Example for a different asset:**
      {
        "totalCo2e": 350.5,
        "units": "kgCO2e",
        "confidenceScore": 0.85,
        "lifecycleBreakdown": {
          "manufacturing": 250,
          "transport": 15.5,
          "use": 75,
          "endOfLife": 10
        },
        "sources": [
          { "name": "Apple Product Environmental Report for MacBook Pro 14-inch", "url": "https://www.apple.com/environment/pdf/products/notebooks/14-inch_MacBook_Pro_PER_Oct2023.pdf" }
        ],
        "description": "Estimation based on Apple's official 2023 lifecycle assessment report for the 14-inch MacBook Pro. Assumes a 4-year lifespan."
      }

      Now, provide the JSON object for the requested asset.
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
