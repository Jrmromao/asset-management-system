export const question = (asset: string) =>
  `What is the lifetime CO2e of a ${asset} in tonnes? Please provide the answer in the following JSON format: {"CO2e": number, "details": string}. The CO2e value should be rounded to 2 decimal places and represent total emissions in metric tonnes. The details should be as concise as possible.`;

export interface ChatGPTResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}
