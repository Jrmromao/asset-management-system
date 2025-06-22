export interface OpenAIConfig {
  // Required
  apiKey: string; // Your OpenAI API key

  // Model Configuration
  model: string; // e.g., 'gpt-4', 'gpt-3.5-turbo'
  modelVersion?: string; // Specific model version if needed

  // Response Configuration
  maxTokens?: number; // Maximum tokens in the response (default: 150)
  temperature?: number; // Response randomness 0-2 (default: 0.3)
  topP?: number; // Nuclear sampling (default: 1)
  n?: number; // Number of responses to generate (default: 1)

  // Stream Configuration
  stream?: boolean; // Whether to stream responses (default: false)

  // Context Configuration
  presencePenalty?: number; // -2.0 to 2.0 (default: 0)
  frequencyPenalty?: number; // -2.0 to 2.0 (default: 0)

  // Stop Sequences
  stop?: string | string[]; // Stop sequences for response

  // Request Configuration
  timeoutMs?: number; // Request timeout in milliseconds
  maxRetries?: number; // Maximum number of retries on failure

  // Response Format
  responseFormat?: {
    type: "json_object"; // Force JSON response
  };

  // Organization Configuration
  organization?: string; // OpenAI organization ID if applicable
}

// Example usage with recommended settings for CO2 calculations
export const OpenAIConfigConst: OpenAIConfig = {
  apiKey: "your-api-key",
  model: "gpt-4",
  maxTokens: 150,
  temperature: 0.3,
  responseFormat: {
    type: "json_object",
  },
  maxRetries: 3,
  timeoutMs: 30000, // 30 second timeout
  presencePenalty: 0,
  frequencyPenalty: 0,
  n: 1,
  stream: false,
};

// Minimal configuration
const minimalConfig: OpenAIConfig = {
  apiKey: "your-api-key",
  model: "gpt-4",
};

// Configuration for high-precision results
const preciseConfig: OpenAIConfig = {
  apiKey: "your-api-key",
  model: "gpt-4",
  temperature: 0.1, // Lower temperature for more deterministic results
  maxTokens: 200, // More tokens for detailed explanations
  responseFormat: {
    type: "json_object",
  },
  presencePenalty: 0.1, // Slight penalty to avoid repetitive responses
  maxRetries: 5, // More retries for critical calculations
};

// Configuration for batch processing
const batchConfig: OpenAIConfig = {
  apiKey: "your-api-key",
  model: "gpt-3.5-turbo", // Faster, more economical model for batch processing
  maxTokens: 100, // Shorter responses for efficiency
  temperature: 0.5, // Balance between creativity and consistency
  n: 1, // Single response per request
  timeoutMs: 60000, // Longer timeout for batch processing
  maxRetries: 3,
};
