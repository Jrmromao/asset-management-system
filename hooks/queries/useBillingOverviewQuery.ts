import { useQuery } from "@tanstack/react-query";

export function useBillingOverviewQuery() {
  return useQuery({
    queryKey: ["billing-overview"],
    queryFn: async () => {
      const res = await fetch("/api/billing/overview");
      if (!res.ok) throw new Error("Failed to fetch billing overview");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
