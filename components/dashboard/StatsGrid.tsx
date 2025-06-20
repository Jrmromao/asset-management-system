"use client";
import { BarChart3, Battery, Box, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getAll } from "@/lib/actions/assets.actions";
import { useEffect, useMemo, useState } from "react";
import { getAssetQuota } from "@/lib/actions/usageRecord.actions";
import { getMaintenanceDueCount } from "@/lib/actions/inventory.actions";
import { getTotalCo2Savings } from "@/lib/actions/co2.actions";

export const StatsGrid = () => {
  // Group the state declarations together for better readability
  const [quota, setQuota] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<number>(0);
  const [co2Savings, setCo2Savings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate assigned assets using useMemo to avoid unnecessary recalculations
  const assetsAssigned = useMemo(
    () => assets.reduce((sum, asset) => sum + (asset.assigneeId ? 1 : 0), 0),
    [assets],
  );

  // Calculate usage rate using useMemo
  const usageRate = useMemo(
    () => (quota > 0 ? (assetsAssigned / quota) * 100 : 0),
    [assetsAssigned, quota],
  );

  // Combine API calls in a single useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [assetsResponse, quotaResponse, maintenanceDueResponse, co2SavingsResponse] = await Promise.all([
          getAll(),
          getAssetQuota(),
          getMaintenanceDueCount(),
          getTotalCo2Savings(),
        ]);

        // setAssets(assetsResponse?.data || ([] as Asset[]));
        setQuota(quotaResponse?.data || 0);
        setMaintenanceDue(maintenanceDueResponse?.data || 0);
        setCo2Savings(co2SavingsResponse?.data || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Assets"
        mainValue={assets.length}
        subValue={`/${quota}`}
        subtitle="+12% vs last month"
        icon={<Box className="h-5 w-5 text-emerald-600" />}
      />

      <StatCard
        title="Utilization Rate"
        mainValue={`${usageRate}%`}
        subtitle="On Target "
        icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
      />
      <StatCard
        title="Maintenance Due"
        mainValue={maintenanceDue}
        subValue="assets"
        subtitle="Action Required"
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />
      <StatCard
        title="CO₂ Savings"
        mainValue={co2Savings}
        subValue="tons"
        subtitle="+2.4 this month"
        icon={<Battery className="h-5 w-5 text-emerald-600" />}
      />
    </div>
  );
};
