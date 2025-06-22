"use client";
import { BarChart3, Battery, Box, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  getAllAssets,
  getAssetUtilizationStats,
} from "@/lib/actions/assets.actions";
import { useEffect, useState } from "react";
import { getAssetQuota } from "@/lib/actions/usageRecord.actions";
import { getMaintenanceDueCount } from "@/lib/actions/inventory.actions";
import {
  getTotalCo2Savings,
  getCo2SavingsTrend,
} from "@/lib/actions/co2.actions";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalAssets: number;
  quota: number;
  maintenanceDue: number;
  co2Savings: number;
  co2Trend: number;
  utilizationRate: number;
  assignedAssets: number;
}

export const StatsGrid = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

        const assets = assetsResponse.data || [];
        const quota = quotaResponse.data || 0;
        const assignedAssets = assets.reduce(
          (sum, asset) => sum + (asset.assignee ? 1 : 0),
          0,
        );
        const calculatedUsageRate = quota > 0 ? (assignedAssets / quota) * 100 : 0;

        const utilizationData = utilizationStatsResponse.data?.[0];
        const displayUtilizationRate =
          utilizationData?.utilizationRate || calculatedUsageRate;
        const displayAssignedAssets =
          utilizationData?.assignedAssets || assignedAssets;
        const displayTotalAssets = utilizationData?.totalAssets || assets.length;

        setStats({
          totalAssets: displayTotalAssets,
          quota: quota,
          maintenanceDue: maintenanceDueResponse.data || 0,
          co2Savings: co2SavingsResponse.data as number,
          co2Trend: co2TrendResponse.data as number,
          utilizationRate: displayUtilizationRate,
          assignedAssets: displayAssignedAssets,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Assets"
        mainValue={stats.totalAssets}
        subValue={`/${stats.quota}`}
        subtitle={`${Math.round(stats.utilizationRate)}% utilization rate`}
        icon={<Box className="h-5 w-5 text-emerald-600" />}
      />

      <StatCard
        title="Utilization Rate"
        mainValue={`${Math.round(stats.utilizationRate)}%`}
        subtitle={`${stats.assignedAssets} of ${stats.totalAssets} assigned`}
        icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
      />

      <StatCard
        title="Maintenance Due"
        mainValue={stats.maintenanceDue}
        subValue="assets"
        subtitle="Within next 30 days"
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />

      <StatCard
        title="CO₂ Savings"
        mainValue={stats.co2Savings}
        subValue="tons"
        subtitle={`+${stats.co2Trend} this month`}
        icon={<Battery className="h-5 w-5 text-emerald-600" />}
      />
    </div>
  );
};
