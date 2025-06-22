export interface GeminiConfig {
  // Required
  apiKey: string; // Your Google AI Studio API key

  // Model Configuration
  model?: string; // e.g., 'gemini-pro', 'gemini-pro-vision'

  // Generation Configuration
  maxOutputTokens?: number; // Maximum length of generated content (default: 150)
  temperature?: number; // Controls randomness 0-1 (default: 0.3)
  topP?: number; // Nucleus sampling (default: 1.0)
  topK?: number; // Top-k sampling (default: 1)

  // Safety Configuration
  safetySettings?: Array<{
    category:
      | "HARM_CATEGORY_UNSPECIFIED"
      | "HARM_CATEGORY_HATE_SPEECH"
      | "HARM_CATEGORY_SEXUALLY_EXPLICIT"
      | "HARM_CATEGORY_HARASSMENT"
      | "HARM_CATEGORY_DANGEROUS_CONTENT";
    threshold: "BLOCK_NONE" | "BLOCK_LOW" | "BLOCK_MEDIUM" | "BLOCK_HIGH";
  }>;

  // Request Configuration
  candidateCount?: number; // Number of response candidates (default: 1)
  stopSequences?: string[]; // List of sequences to stop generation
  timeoutMs?: number; // Request timeout in milliseconds
  maxRetries?: number; // Maximum number of retries on failure

  // Project Configuration
  projectId?: string; // Google Cloud project ID if applicable
  location?: string; // API endpoint location
}

// Example usage with recommended settings for CO2 calculations
export const GeminiConfigConst: GeminiConfig = {
  apiKey: "your-api-key",
  model: "gemini-pro",
  maxOutputTokens: 150,
  temperature: 0.3,
  topK: 1,
  topP: 1,
  candidateCount: 1,
  timeoutMs: 30000, // 30 second timeout
  maxRetries: 3,
  safetySettings: [
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM",
    },
  ],
};

// Minimal configuration
const minimalConfig: GeminiConfig = {
  apiKey: "your-api-key",
  model: "gemini-pro",
};

// Configuration for high-precision results
const preciseConfig: GeminiConfig = {
  apiKey: "your-api-key",
  model: "gemini-pro",
  temperature: 0.1, // Lower temperature for more deterministic results
  maxOutputTokens: 200, // More tokens for detailed explanations
  topK: 1,
  topP: 0.8,
  candidateCount: 1,
  maxRetries: 5, // More retries for critical calculations
  timeoutMs: 45000, // Extended timeout for detailed responses
};

// Configuration for batch processing
const batchConfig: GeminiConfig = {
  apiKey: "your-api-key",
  model: "gemini-pro",
  maxOutputTokens: 100, // Shorter responses for efficiency
  temperature: 0.5, // Balance between creativity and consistency
  candidateCount: 1,
  timeoutMs: 60000, // Longer timeout for batch processing
  maxRetries: 3,
  topK: 40, // Broader sampling for varied responses
  topP: 0.95,
};

// Error handling utility for Gemini configuration
function validateGeminiConfig(config: GeminiConfig): void {
  if (!config.apiKey) {
    throw new Error("API key is required");
  }

  if (
    config.temperature &&
    (config.temperature < 0 || config.temperature > 1)
  ) {
    throw new Error("Temperature must be between 0 and 1");
  }

  if (config.maxOutputTokens && config.maxOutputTokens < 1) {
    throw new Error("maxOutputTokens must be positive");
  }

  if (config.topP && (config.topP < 0 || config.topP > 1)) {
    throw new Error("topP must be between 0 and 1");
  }

  if (config.timeoutMs && config.timeoutMs < 1000) {
    throw new Error("Timeout must be at least 1000ms");
  }
}

// Helper function to merge with default configuration
function createGeminiConfig(config: Partial<GeminiConfig>): GeminiConfig {
  const defaultConfig: GeminiConfig = {
    apiKey: "",
    model: "gemini-pro",
    maxOutputTokens: 150,
    temperature: 0.3,
    topK: 1,
    topP: 1,
    candidateCount: 1,
    timeoutMs: 30000,
    maxRetries: 3,
  };

  return { ...defaultConfig, ...config };
}
