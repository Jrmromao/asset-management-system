import { useQuery } from "@tanstack/react-query";

export function useReportData(reportType: string, dateRange: string) {
  return useQuery({
    queryKey: ["report", reportType, dateRange],
    queryFn: async () => {
      const res = await fetch(`/api/reports/${reportType}?range=${dateRange}`);
      if (!res.ok) throw new Error("Failed to fetch report data");
      return res.json();
    },
    enabled: !!reportType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
