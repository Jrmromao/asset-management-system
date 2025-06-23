export interface CO2CalculationResult {
  totalCo2e: number;
  units: string;
  confidenceScore: number;
  lifecycleBreakdown: {
    manufacturing: number | "N/A";
    transport: number | "N/A";
    use: number | "N/A";
    endOfLife: number | "N/A";
  };
  sources: Array<{ name: string; url: string }>;
  description: string;
}
