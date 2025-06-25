import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Types for AI providers
type AIProvider = "openai" | "deepseek" | "gemini";

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider?: AIProvider;
}

interface ProviderConfig {
  openai?: {
    apiKey: string;
    baseURL?: string;
    model?: string;
  };
  deepseek?: {
    apiKey: string;
    baseURL: string;
    model?: string;
  };
  gemini?: {
    apiKey: string;
    model?: string;
  };
}

class MultiProviderAIService {
  private providers: Map<AIProvider, any> = new Map();
  private config: ProviderConfig;
  private providerOrder: AIProvider[] = ["openai", "deepseek", "gemini"];

  constructor() {
    this.config = this.loadConfig();
    this.initializeProviders();
  }

  private loadConfig(): ProviderConfig {
    return {
      openai: process.env.OPENAI_API_KEY
        ? {
            apiKey: process.env.OPENAI_API_KEY,
            model: "gpt-4o-mini",
          }
        : undefined,
      deepseek: process.env.DEEPSEEK_API_KEY
        ? {
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL:
              process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1",
            model: "deepseek-chat",
          }
        : undefined,
      gemini: process.env.GEMINI_API_KEY
        ? {
            apiKey: process.env.GEMINI_API_KEY,
            model: "gemini-1.5-flash",
          }
        : undefined,
    };
  }

  private initializeProviders() {
    // Initialize OpenAI
    if (this.config.openai) {
      try {
        this.providers.set(
          "openai",
          new OpenAI({
            apiKey: this.config.openai.apiKey,
            baseURL: this.config.openai.baseURL,
          }),
        );
        console.log("✅ OpenAI provider initialized");
      } catch (error) {
        console.warn("⚠️ Failed to initialize OpenAI provider:", error);
      }
    }

    // Initialize DeepSeek (using OpenAI SDK with custom baseURL)
    if (this.config.deepseek) {
      try {
        this.providers.set(
          "deepseek",
          new OpenAI({
            apiKey: this.config.deepseek.apiKey,
            baseURL: this.config.deepseek.baseURL,
          }),
        );
        console.log("✅ DeepSeek provider initialized");
      } catch (error) {
        console.warn("⚠️ Failed to initialize DeepSeek provider:", error);
      }
    }

    // Initialize Gemini
    if (this.config.gemini) {
      try {
        this.providers.set(
          "gemini",
          new GoogleGenerativeAI(this.config.gemini.apiKey),
        );
        console.log("✅ Gemini provider initialized");
      } catch (error) {
        console.warn("⚠️ Failed to initialize Gemini provider:", error);
      }
    }

    console.log(
      `🔧 AI Service initialized with ${this.providers.size} providers:`,
      Array.from(this.providers.keys()),
    );
  }

  private async callOpenAI(
    prompt: string,
    provider: "openai" | "deepseek",
  ): Promise<any> {
    const client = this.providers.get(provider);
    if (!client) throw new Error(`${provider} provider not available`);

    const model =
      provider === "openai"
        ? this.config.openai?.model || "gpt-4o-mini"
        : this.config.deepseek?.model || "deepseek-chat";

    // Use deterministic parameters for consistent results
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.0, // Maximum determinism
      seed: 42, // Fixed seed for reproducibility
      top_p: 1.0, // Use all tokens for consistency
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  }

  private async callGemini(prompt: string): Promise<any> {
    const client = this.providers.get("gemini");
    if (!client) throw new Error("Gemini provider not available");

    const model = client.getGenerativeModel({
      model: this.config.gemini?.model || "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.0, // Maximum determinism
        maxOutputTokens: 4000,
        topP: 1.0, // Use all tokens for consistency
        topK: 1, // Most deterministic setting
      },
    });

    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No additional text or explanations.`;
    const result = await model.generateContent(jsonPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up response to ensure it's valid JSON
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  }

  public async calculateAssetCO2WithFallback(
    assetName: string,
    manufacturer: string,
    model: string,
    preferredProvider?: AIProvider,
  ): Promise<AIResponse> {
    const prompt = this.buildCO2Prompt(assetName, manufacturer, model);

    // Set provider order based on preference
    const orderedProviders = preferredProvider
      ? [
          preferredProvider,
          ...this.providerOrder.filter((p) => p !== preferredProvider),
        ]
      : this.providerOrder;

    const availableProviders = orderedProviders.filter((provider) =>
      this.providers.has(provider),
    );

    if (availableProviders.length === 0) {
      return {
        success: false,
        error: "No AI providers are available. Please check your API keys.",
      };
    }

    console.log(
      `🤖 Attempting CO2 calculation with providers: ${availableProviders.join(", ")}`,
    );

    for (const provider of availableProviders) {
      try {
        console.log(`🔄 Trying ${provider} provider...`);

        let result;
        if (provider === "openai" || provider === "deepseek") {
          result = await this.callOpenAI(prompt, provider);
        } else if (provider === "gemini") {
          result = await this.callGemini(prompt);
        }

        // Validate response
        if (this.validateCO2Response(result)) {
          console.log(`✅ Successfully calculated CO2 using ${provider}`);
          return {
            success: true,
            data: result,
            provider,
          };
        } else {
          console.warn(`⚠️ ${provider} returned invalid response format`);
          continue;
        }
      } catch (error) {
        console.error(`❌ ${provider} provider failed:`, error);

        // If this is the last provider, return the error
        if (provider === availableProviders[availableProviders.length - 1]) {
          return {
            success: false,
            error: `All AI providers failed. Last error from ${provider}: ${error instanceof Error ? error.message : "Unknown error"}`,
            provider,
          };
        }

        // Continue to next provider
        continue;
      }
    }

    return {
      success: false,
      error: "All AI providers failed to generate a valid response",
    };
  }

  private buildCO2Prompt(
    assetName: string,
    manufacturer: string,
    model: string,
  ): string {
    return `
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
         - Category 4: Upstream transportation (shipping)
         - Category 12: End-of-life treatment
      6. **Include activity data** used for calculations (weight, power consumption, lifespan)
      7. **Provide confidence score** (0-1) and cite data sources
      8. **Include uncertainty range** (±%) to indicate calculation precision

      **JSON Output Format:**
      {
        "totalCo2e": number,
        "units": "kgCO2e",
        "confidenceScore": number,
        "uncertaintyRange": number,
        "primaryScope": 1 | 2 | 3,
        "primaryScopeCategory": "string describing main category",
        "methodology": "Brief description of calculation methodology",
        "lifecycleBreakdown": {
          "manufacturing": number,
          "transport": number,
          "use": number,
          "endOfLife": number
        },
        "scopeBreakdown": {
          "scope1": {
            "total": number,
            "categories": {}
          },
          "scope2": {
            "total": number,
            "locationBased": number,
            "marketBased": number
          },
          "scope3": {
            "total": number,
            "categories": {
              "purchasedGoods": number,
              "upstreamTransport": number,
              "endOfLifeTreatment": number
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
            "region": "Global"
          }
        ],
        "sources": [
          { "name": "Source Name", "url": "Source URL or identifier" }
        ],
        "description": "Brief summary of the methodology and assumptions made."
      }

      Respond ONLY with valid JSON. No additional text.
    `;
  }

  private validateCO2Response(response: any): boolean {
    const requiredFields = [
      "totalCo2e",
      "units",
      "confidenceScore",
      "lifecycleBreakdown",
      "scopeBreakdown",
      "primaryScope",
      "methodology",
    ];

    return (
      requiredFields.every((field) => field in response) &&
      response.totalCo2e > 0 &&
      response.confidenceScore >= 0 &&
      response.confidenceScore <= 1
    );
  }

  public getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  public getProviderStatus(): Record<AIProvider, boolean> {
    return {
      openai: this.providers.has("openai"),
      deepseek: this.providers.has("deepseek"),
      gemini: this.providers.has("gemini"),
    };
  }
}

// Export singleton instance
export const aiService = new MultiProviderAIService();

// Export the main function for backwards compatibility
export async function calculateAssetCo2(
  assetName: string,
  manufacturer: string,
  model: string,
  preferredProvider?: AIProvider,
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
  provider?: AIProvider;
}> {
  return aiService.calculateAssetCO2WithFallback(
    assetName,
    manufacturer,
    model,
    preferredProvider,
  );
}

export type { AIProvider };
export { MultiProviderAIService };
