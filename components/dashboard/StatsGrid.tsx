"use client";
import { BarChart3, Battery, Box, Clock, AlertTriangle } from "lucide-react";
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
import { getAll as getAllLicenses } from "@/lib/actions/license.actions";
import { getAllAccessories } from "@/lib/actions/accessory.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuotaInfo } from "@/lib/services/usage.service";
import { auth } from "@clerk/nextjs/server";

interface DashboardStats {
  totalItems: number;
  itemsBreakdown: {
    assets: number;
    licenses: number;
    accessories: number;
  };
  quota: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
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
          licensesResponse,
          accessoriesResponse,
          quotaResponse,
          maintenanceDueResponse,
          co2SavingsResponse,
          co2TrendResponse,
          utilizationStatsResponse,
        ] = await Promise.all([
          getAllAssets(),
          getAllLicenses(),
          getAllAccessories(),
          getAssetQuota(),
          getMaintenanceDueCount(),
          getTotalCo2Savings(),
          getCo2SavingsTrend(),
          getAssetUtilizationStats(),
        ]);

        console.log("Dashboard data fetched:", {
          assetsResponse,
          licensesResponse,
          accessoriesResponse,
          quotaResponse,
          maintenanceDueResponse,
          co2SavingsResponse,
          co2TrendResponse,
          utilizationStatsResponse,
        });

        const assets = assetsResponse.data || [];
        const licenses = licensesResponse.data || [];
        const accessories = accessoriesResponse.data || [];
        const quota = quotaResponse.data || 50;

        // Fix: Check for userId instead of assignee
        const assignedAssets = assets.reduce(
          (sum, asset) => sum + (asset.userId ? 1 : 0),
          0,
        );

        const calculatedUsageRate =
          assets.length > 0 ? (assignedAssets / assets.length) * 100 : 0;

        // Use the utilization stats response for more accurate data
        const utilizationData = utilizationStatsResponse.data;
        const displayUtilizationRate =
          utilizationData?.utilizationRate || calculatedUsageRate;
        const displayAssignedAssets =
          utilizationData?.assignedAssets || assignedAssets;

        // FIXED: Actual unified item counting
        const itemsBreakdown = {
          assets: assets.length,
          licenses: licenses.length,
          accessories: accessories.length,
        };

        const totalItems =
          itemsBreakdown.assets +
          itemsBreakdown.licenses +
          itemsBreakdown.accessories;

        setStats({
          totalItems,
          itemsBreakdown,
          quota: {
            used: totalItems,
            limit: quota,
            remaining: Math.max(0, quota - totalItems),
            percentage: Math.round((totalItems / quota) * 100),
          },
          maintenanceDue: maintenanceDueResponse.data || 0,
          co2Savings: (co2SavingsResponse.data as number) || 0,
          co2Trend: (co2TrendResponse.data as number) || 0,
          utilizationRate: displayUtilizationRate,
          assignedAssets: displayAssignedAssets,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set default values in case of error
        setStats({
          totalItems: 0,
          itemsBreakdown: { assets: 0, licenses: 0, accessories: 0 },
          quota: { used: 0, limit: 50, remaining: 50, percentage: 0 },
          maintenanceDue: 0,
          co2Savings: 0,
          co2Trend: 0,
          utilizationRate: 0,
          assignedAssets: 0,
        });
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

  // Determine quota status color and icon
  const getQuotaColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-amber-600";
    return "text-emerald-600";
  };

  const quotaIcon =
    stats.quota.percentage >= 90 ? (
      <AlertTriangle className="h-5 w-5 text-red-600" />
    ) : (
      <Box className="h-5 w-5 text-emerald-600" />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Items"
        mainValue={stats.totalItems}
        subValue={`/${stats.quota.limit}`}
        subtitle={`${stats.quota.remaining} remaining • ${stats.quota.percentage}% used`}
        icon={quotaIcon}
        tooltip={`Assets: ${stats.itemsBreakdown.assets} • Licenses: ${stats.itemsBreakdown.licenses} • Accessories: ${stats.itemsBreakdown.accessories}`}
      />

      <StatCard
        title="Asset Utilization"
        mainValue={`${Math.round(stats.utilizationRate)}%`}
        subtitle={`${stats.assignedAssets} of ${stats.itemsBreakdown.assets} assigned`}
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
