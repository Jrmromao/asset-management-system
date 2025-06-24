import { CO2CalculationResult } from "@/types/co2";

// Simple in-memory store to work around Next.js server action serialization issues
class CO2Store {
  private static instance: CO2Store;
  private store: Map<string, CO2CalculationResult> = new Map();

  static getInstance(): CO2Store {
    if (!CO2Store.instance) {
      CO2Store.instance = new CO2Store();
    }
    return CO2Store.instance;
  }

  set(key: string, data: CO2CalculationResult): void {
    this.store.set(key, data);
    // Auto-cleanup after 10 minutes to prevent memory leaks
    setTimeout(
      () => {
        this.store.delete(key);
      },
      10 * 60 * 1000,
    );
  }

  get(key: string): CO2CalculationResult | null {
    return this.store.get(key) || null;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }
}

export const co2Store = CO2Store.getInstance();
