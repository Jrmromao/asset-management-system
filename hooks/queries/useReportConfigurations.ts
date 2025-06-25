import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ReportMetric {
  id?: string;
  category: string;
  metricName: string;
  enabled: boolean;
}

export interface ReportConfiguration {
  id?: string;
  name: string;
  format: string;
  timePeriod: string;
  isScheduled: boolean;
  scheduleFrequency?: string;
  companyId: string;
  metrics: ReportMetric[];
  createdAt?: Date;
  updatedAt?: Date;
  _count?: {
    generatedReports: number;
  };
}

export function useReportConfigurations(companyId?: string) {
  return useQuery({
    queryKey: ["reportConfigurations", companyId],
    queryFn: async () => {
      if (!companyId) throw new Error("Company ID is required");

      const res = await fetch(
        `/api/reports/configurations?companyId=${companyId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch report configurations");
      return res.json();
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReportConfiguration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configuration: ReportConfiguration) => {
      const res = await fetch("/api/reports/configurations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(configuration),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create report configuration");
      }

      return res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch configurations
      queryClient.invalidateQueries({
        queryKey: ["reportConfigurations", variables.companyId],
      });
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      configurationId,
      generateNow = true,
    }: {
      configurationId: string;
      generateNow?: boolean;
    }) => {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ configurationId, generateNow }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate report");
      }

      return res.json();
    },
    onSuccess: () => {
      // Invalidate reports data to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["report", "all"],
      });
    },
  });
}
