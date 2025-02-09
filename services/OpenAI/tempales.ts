export const question = (asset: string) =>
  `What is the CO2e of a ${asset}? Please provide the answer in the following JSON format: {\"CO2e\": \"value\", \"details\": \"short explanation\"}`;

export interface ChatGPTResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}
