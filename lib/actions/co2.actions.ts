"use server";

import { handleError } from "@/lib/utils";

export const getTotalCo2Savings = async () => {
  try {
    // In a real scenario, you would fetch this data from your database
    // For now, we'll return a static value
    const savings = 12.5;
    return { data: savings, error: null };
  } catch (error) {
    return handleError(error);
  }
};
