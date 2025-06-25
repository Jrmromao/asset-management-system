"use client";

import { useState, useEffect } from "react";
import { getAssetDistribution } from "@/lib/actions/assets.actions";
import { toast } from "sonner";

interface AssetDistributionData {
  name: string;
  count: number;
  percentage: number;
  status: "Healthy" | "Warning" | "Critical";
  utilization: number;
}

export const useAssetDistribution = () => {
  const [data, setData] = useState<AssetDistributionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAssetDistribution();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || "Failed to fetch asset distribution");
        toast.error("Failed to load asset distribution data");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast.error("Error loading asset distribution data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}; 