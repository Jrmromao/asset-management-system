import { OpenAIConfig } from "@/config/OpenAIConfig";
import { GeminiConfig } from "@/config/GeminiConfig";

export interface CO2Response {
  CO2e: number;
  details: string;
  CO2eType: string;
  sourceOrActivity: string;
  unit: string;
}

// Minimal interface for CO2 calculation
export interface CO2CalculationInput {
  name: string; // Required: Name/type of item
  category?: string; // Optional: Category of item
  energyRating?: string; // Optional: Energy efficiency rating
  dailyOperationHours?: number; // Optional: Hours of operation per day
  weight?: number; // Optional: Weight in kg
  material?: string; // Optional: Primary material
  department?: string; // Optional: Department/location of use
  price?: number; // Optional: Price in currency
  powerConsumption?: number; // Optional: Power consumption in watts/kW
  powerUnit?: string; // Optional: Unit of power (W, kW)
  yearOfManufacture?: number; // Optional: Year of manufacture
  expectedLifespan?: number; // Optional: Expected lifespan in years
  location?: string; // Optional: Geographic location
  usage?: string; // Optional: Type of usage (e.g., "heavy", "light")
}

class CO2Calculator {
  private openaiConfig: OpenAIConfig | null = null;
  private geminiConfig: GeminiConfig | null = null;
  private maxTokens = 150;

  constructor(config: { openai?: OpenAIConfig; gemini?: GeminiConfig }) {
    if (config.openai) this.openaiConfig = config.openai;
    if (config.gemini) this.geminiConfig = config.gemini;

    if (!this.openaiConfig && !this.geminiConfig) {
      throw new Error(
        "At least one API configuration (OpenAI or Gemini) must be provided",
      );
    }
  }

  private getCategoryContext(category?: string): string {
    const categoryContexts: Record<string, string> = {
      Electronics:
        "considering the electronic components, rare earth metals, and e-waste impact",
      "Industrial Equipment":
        "factoring in industrial manufacturing processes and heavy material usage",
      Furniture: "considering sustainable materials and production methods",
      HVAC: "including refrigerant impact and energy efficiency over time",
      Lighting: "factoring in energy efficiency and lifespan",
      Vehicles: "including fuel consumption and maintenance emissions",
      "Office Equipment": "considering power consumption and electronic waste",
      "Medical Equipment": "including sterilization and specialized materials",
    };

    return category ? categoryContexts[category] || "" : "";
  }

  private getUsageContext(input: CO2CalculationInput): string {
    const contexts: string[] = [];

    if (input.powerConsumption) {
      contexts.push(
        `consuming ${input.powerConsumption}${input.powerUnit || "W"} of power`,
      );
    }

    if (input.dailyOperationHours && input.expectedLifespan) {
      const yearlyHours = input.dailyOperationHours * 365;
      const lifetimeHours = yearlyHours * input.expectedLifespan;
      contexts.push(
        `operating for approximately ${lifetimeHours.toLocaleString()} hours over its ${input.expectedLifespan}-year lifespan`,
      );
    }

    if (input.usage) {
      contexts.push(`under ${input.usage} usage conditions`);
    }

    return contexts.join(", ");
  }

  private getMaterialContext(material?: string): string {
    const materialContexts: Record<string, string> = {
      Aluminum: "considering the energy-intensive aluminum production process",
      Steel: "factoring in steel manufacturing and recycling potential",
      Plastic: "including petroleum-based materials and recycling implications",
      Wood: "considering sustainable forestry and end-of-life decomposition",
      Glass: "including high-temperature manufacturing process",
      "Carbon Fiber": "factoring in specialized manufacturing processes",
    };

    return material ? materialContexts[material] || "" : "";
  }

  private buildPrompt(input: CO2CalculationInput): string {
    // Enhanced prompt with example and explicit instructions
    let basePrompt = `Calculate the carbon footprint (CO2e) of a ${input.name}`;
    const details: string[] = [];
    const contexts: string[] = [];

    if (input.energyRating) details.push(`energy rating ${input.energyRating}`);
    if (input.weight) details.push(`weighing ${input.weight}kg`);
    if (input.material) {
      details.push(`made of ${input.material}`);
      const materialContext = this.getMaterialContext(input.material);
      if (materialContext) contexts.push(materialContext);
    }
    if (input.category) {
      details.push(`in category ${input.category}`);
      const categoryContext = this.getCategoryContext(input.category);
      if (categoryContext) contexts.push(categoryContext);
    }
    if (input.department) details.push(`used in ${input.department}`);

    const usageContext = this.getUsageContext(input);
    if (usageContext) contexts.push(usageContext);

    if (details.length > 0) basePrompt += ` ${details.join(", ")}`;
    if (contexts.length > 0) basePrompt += `, ${contexts.join(", ")}`;

    basePrompt += `. In your calculation, please consider:`;
    basePrompt += `\n1. Manufacturing emissions (raw materials, production processes)`;
    basePrompt += `\n2. Transportation emissions (supply chain, delivery)`;
    basePrompt += `\n3. Usage phase emissions (energy consumption, maintenance)`;
    basePrompt += `\n4. End-of-life emissions (disposal, recycling potential)`;
    if (input.location) {
      basePrompt += `\nPlease adjust for ${input.location} location-specific factors.`;
    }

    // Add example Q&A
    basePrompt += `\n\nExample:`;
    basePrompt += `\nInput: Laptop, 2kg, energy rating A, used 8h/day, 5 years, in Germany`;
    basePrompt += `\nOutput: {"CO2e": 320, "unit": "kg", "CO2eType": "one-time", "sourceOrActivity": "manufacturing", "details": "Includes production, transport, 5 years of use, and recycling in Germany."}`;

    basePrompt += `\n\nNow, for the following input:`;
    basePrompt += `\n${input.name}, ${details.join(", ")}`;
    basePrompt += `\nReturn only a single JSON object as shown above. Each field must be present. The details field should briefly explain the calculation steps or main factors considered.`;

    return basePrompt;
  }

  private validateCO2Response(data: any): data is CO2Response {
    return (
      typeof data === "object" &&
      typeof data.CO2e === "number" &&
      typeof data.unit === "string" &&
      typeof data.CO2eType === "string" &&
      typeof data.sourceOrActivity === "string" &&
      typeof data.details === "string"
    );
  }

  // Helper for fetch with timeout
  private async fetchWithTimeout(
    resource: RequestInfo,
    options: RequestInit = {},
    timeoutMs = 15000,
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(resource, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  // Helper for retries with exponential backoff
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = 3,
    baseDelay = 500,
    maxDelay = 4000,
  ): Promise<T> {
    let attempt = 0;
    let lastError: any;
    while (attempt <= retries) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        if (attempt === retries) break;
        const delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
      }
    }
    throw lastError;
  }

  private async callOpenAI(
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      timeoutMs?: number;
      retries?: number;
      baseDelay?: number;
      maxDelay?: number;
    },
  ): Promise<CO2Response> {
    if (!this.openaiConfig) {
      throw new Error("OpenAI configuration not provided");
    }

    const model = options?.model || this.openaiConfig.model || "gpt-4-turbo";
    const temperature =
      options?.temperature ?? this.openaiConfig.temperature ?? 0.2;
    const max_tokens = options?.maxTokens ?? this.openaiConfig.maxTokens ?? 300;
    const timeoutMs = options?.timeoutMs ?? 15000;
    const retries = options?.retries ?? 3;
    const baseDelay = options?.baseDelay ?? 500;
    const maxDelay = options?.maxDelay ?? 4000;

    let response: Response;
    try {
      response = await this.retryWithBackoff(
        () =>
          this.fetchWithTimeout(
            process.env.OPENAI_API_URL!,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.openaiConfig?.apiKey}`,
              },
              body: JSON.stringify({
                model,
                messages: [
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                max_tokens,
                temperature,
                response_format: { type: "json_object" },
              }),
            },
            timeoutMs,
          ),
        retries,
        baseDelay,
        maxDelay,
      );
    } catch (err) {
      console.error("OpenAI API network error (with retries):", err);
      throw new Error("OpenAI API network error (with retries)");
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `OpenAI API error: ${response.statusText}`,
        "details:",
        errorText,
      );
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (err) {
      console.error("Failed to parse OpenAI response as JSON:", err);
      throw new Error("Failed to parse OpenAI response as JSON");
    }

    let parsed: any;
    try {
      if (!data?.choices || !data.choices[0]?.message?.content) {
        throw new Error("OpenAI response missing choices/message/content");
      }
      parsed = JSON.parse(data.choices[0].message.content);
    } catch (err) {
      console.error(
        "Failed to parse OpenAI message content as JSON:",
        err,
        data,
      );
      throw new Error("Failed to parse OpenAI message content as JSON");
    }

    if (!this.validateCO2Response(parsed)) {
      console.error(
        "OpenAI response does not match CO2Response schema:",
        parsed,
      );
      throw new Error("OpenAI response does not match CO2Response schema");
    }

    return parsed;
  }

  async calculateCO2e(
    input: CO2CalculationInput,
    preferredApi: "openai" | "gemini" = "openai",
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      timeoutMs?: number;
      retries?: number;
      baseDelay?: number;
      maxDelay?: number;
    },
  ): Promise<CO2Response> {
    const prompt = this.buildPrompt(input);
    try {
      if (preferredApi === "openai" && this.openaiConfig) {
        return await this.callOpenAI(prompt, options);
      }
      throw new Error("No API configuration available");
    } catch (error) {
      console.error("Failed to calculate CO2e:", error);
      throw new Error(`Failed to calculate CO2e: ${error}`);
    }
  }
}

export default CO2Calculator;
