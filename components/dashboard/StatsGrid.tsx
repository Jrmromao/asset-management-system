"use client";
import { BarChart3, Battery, Box, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getAllAssets,
  getAssetUtilizationStats,
} from "@/lib/actions/assets.actions";
import { useEffect, useMemo, useState } from "react";
import { getAssetQuota } from "@/lib/actions/usageRecord.actions";
import { getMaintenanceDueCount } from "@/lib/actions/inventory.actions";
import {
  getTotalCo2Savings,
  getCo2SavingsTrend,
} from "@/lib/actions/co2.actions";
import type { Asset } from "@/types/asset";

export const StatsGrid = () => {
  // Group the state declarations together for better readability
  const [quota, setQuota] = useState<number>(0);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<number>(0);
  const [co2Savings, setCo2Savings] = useState<number>(0);
  const [co2Trend, setCo2Trend] = useState<number>(0);
  const [utilizationStats, setUtilizationStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate assigned assets using useMemo to avoid unnecessary recalculations
  const assetsAssigned = useMemo(
    () => assets.reduce((sum, asset) => sum + (asset.assignee ? 1 : 0), 0),
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
        const [
          assetsResponse,
          quotaResponse,
          maintenanceDueResponse,
          co2SavingsResponse,
          co2TrendResponse,
          utilizationStatsResponse,
        ] = await Promise.all([
          getAllAssets(),
          getAssetQuota(),
          getMaintenanceDueCount(),
          getTotalCo2Savings(),
          getCo2SavingsTrend(),
          getAssetUtilizationStats(),
        ]);

        if (assetsResponse.success) {
          setAssets(assetsResponse.data || []);
        }
        if (quotaResponse.success) {
          setQuota(quotaResponse.data || 0);
        }
        if (maintenanceDueResponse.success) {
          setMaintenanceDue(maintenanceDueResponse.data || 0);
        }
        if (co2SavingsResponse.data) {
          setCo2Savings(co2SavingsResponse.data as number);
        }
        if (co2TrendResponse.data) {
          setCo2Trend(co2TrendResponse.data as number);
        }
        if (utilizationStatsResponse.success) {
          setUtilizationStats(utilizationStatsResponse.data?.[0] || null);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Use real utilization data if available, otherwise fall back to calculated values
  const displayUtilizationRate = utilizationStats?.utilizationRate || usageRate;
  const displayAssignedAssets =
    utilizationStats?.assignedAssets || assetsAssigned;
  const displayTotalAssets = utilizationStats?.totalAssets || assets.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Assets"
        mainValue={displayTotalAssets}
        subValue={`/${quota}`}
        subtitle={`${Math.round(displayUtilizationRate)}% utilization rate`}
        icon={<Box className="h-5 w-5 text-emerald-600" />}
      />

      <StatCard
        title="Utilization Rate"
        mainValue={`${Math.round(displayUtilizationRate)}%`}
        subtitle={`${displayAssignedAssets} of ${displayTotalAssets} assigned`}
        icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
      />

      <StatCard
        title="Maintenance Due"
        mainValue={maintenanceDue}
        subValue="assets"
        subtitle="Within next 30 days"
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />

      <StatCard
        title="CO₂ Savings"
        mainValue={co2Savings}
        subValue="tons"
        subtitle={`+${co2Trend} this month`}
        icon={<Battery className="h-5 w-5 text-emerald-600" />}
      />
    </div>
  );
};
