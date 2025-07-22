import { useQuery } from "@tanstack/react-query";

export function useAllReports() {
  return useQuery({
    queryKey: ["allReports"],
    queryFn: async () => {
      const res = await fetch("/api/reports/all-reports");
      if (!res.ok) throw new Error("Failed to fetch all reports");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
