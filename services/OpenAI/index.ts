import { OpenAIConfig } from "@/config/OpenAIConfig";
import { GeminiConfig } from "@/config/GeminiConfig";

export interface CO2Response {
  CO2e: string;
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
    // Base prompt construction
    let basePrompt = `Calculate the carbon footprint (CO2e) of a ${input.name}`;
    const details: string[] = [];
    const contexts: string[] = [];

    // Add specifications
    if (input.energyRating) {
      details.push(`energy rating ${input.energyRating}`);
    }
    if (input.weight) {
      details.push(`weighing ${input.weight}kg`);
    }
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
    if (input.department) {
      details.push(`used in ${input.department}`);
    }

    // Add usage patterns
    const usageContext = this.getUsageContext(input);
    if (usageContext) {
      contexts.push(usageContext);
    }

    // Combine all details
    if (details.length > 0) {
      basePrompt += ` ${details.join(", ")}`;
    }

    // Add contextual information
    if (contexts.length > 0) {
      basePrompt += `, ${contexts.join(", ")}`;
    }

    // Add calculation guidance
    basePrompt += ". In your calculation, please consider:";
    basePrompt +=
      "\n1. Manufacturing emissions (raw materials, production processes)";
    basePrompt += "\n2. Transportation emissions (supply chain, delivery)";
    basePrompt +=
      "\n3. Usage phase emissions (energy consumption, maintenance)";
    basePrompt += "\n4. End-of-life emissions (disposal, recycling potential)";

    if (input.location) {
      basePrompt += `\nPlease adjust for ${input.location} location-specific factors.`;
    }

    basePrompt +=
      '\nProvide the answer in the following JSON format: {"CO2e": "value", "CO2eType": "value", sourceOrActivity": "value", "details": "short explanation"}';

    return basePrompt;
  }

  private async callOpenAI(prompt: string): Promise<CO2Response> {
    if (!this.openaiConfig) {
      throw new Error("OpenAI configuration not provided");
    }

    const response = await fetch(process.env.OPENAI_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.openaiConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiConfig.model || "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: this.openaiConfig.maxTokens || 150,
        temperature: this.openaiConfig.temperature || 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    try {
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      throw new Error("Failed to parse OpenAI response as CO2Response");
    }
  }

  async calculateCO2e(
    input: CO2CalculationInput,
    preferredApi: "openai" | "gemini" = "openai",
  ): Promise<CO2Response> {
    const prompt = this.buildPrompt(input);

    try {
      if (preferredApi === "openai" && this.openaiConfig) {
        return await this.callOpenAI(prompt);
      }
      throw new Error("No API configuration available");
    } catch (error) {
      throw new Error(`Failed to calculate CO2e: ${error}`);
    }
  }
}

export default CO2Calculator;
