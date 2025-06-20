"use server";

import { AuthResponse } from "@/lib/middleware/withAuth";
import { handleError } from "@/lib/utils";

/**
 * Analyzes a prompt with an LLM and returns the response.
 * @param prompt - The prompt to send to the LLM.
 * @returns The content of the LLM's response.
 */
export const analyzeWithLlm = async (prompt: string): Promise<AuthResponse<string>> => {
  try {
    const response = await fetch(process.env.OPENAI_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Corrected model name
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    return { success: true, data: content };
  } catch (error) {
    return {
      data: null as any,
      success: false,
    }
  }
};
