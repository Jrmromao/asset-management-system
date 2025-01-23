import { BarChart3, Battery, Box, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getAll } from "@/lib/actions/assets.actions";
import { useEffect } from "react";
import { useAssetQuery } from "@/hooks/queries/useAssetQuery";

export const StatsGrid = () => {
  const { assets } = useAssetQuery();

  useEffect(() => {
    getAll();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total Assets"
        mainValue={assets.length}
        subValue="/2000"
        subtitle="+12% vs last month"
        icon={<Box className="h-5 w-5 text-emerald-600" />}
      />
      <StatCard
        title="Utilization Rate"
        mainValue="85%"
        subtitle="On Target"
        icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
      />
      <StatCard
        title="Maintenance Due"
        mainValue={5}
        subValue="assets"
        subtitle="Action Required"
        icon={<Clock className="h-5 w-5 text-amber-600" />}
      />
      <StatCard
        title="CO₂ Savings"
        mainValue={12.5}
        subValue="tons"
        subtitle="+2.4 this month"
        icon={<Battery className="h-5 w-5 text-emerald-600" />}
      />
    </div>
  );
};
