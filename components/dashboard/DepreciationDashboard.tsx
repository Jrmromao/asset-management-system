"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calculator,
  PieChart,
  Info,
} from "lucide-react";
import { calculatePortfolioDepreciation } from "@/lib/actions/depreciation.actions";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import AnimatedCounter from "@/components/AnimatedCounter";
import { AssetBarChart } from "@/components/dashboard/AssetBarChart";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  getDepreciationPercentage,
  getValueRetentionPercentage,
} from "@/utils/depreciation";

interface DepreciationStats {
  totalPurchaseValue: number;
  totalCurrentValue: number;
  totalDepreciation: number;
  averageDepreciationRate: number;
  assetsByDepreciationMethod: Record<string, number>;
  assetsNeedingReplacement: number;
}

export function DepreciationDashboard() {
  const [stats, setStats] = useState<DepreciationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    loadDepreciationStats();
  }, []);

  const loadDepreciationStats = async () => {
    try {
      setLoading(true);
      const companyIdRaw = user?.publicMetadata?.companyId;
      const companyId = typeof companyIdRaw === "string" ? companyIdRaw : "";
      if (!companyId) {
        toast({
          title: "Error",
          description: "No company ID found for this user.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const result = await calculatePortfolioDepreciation(companyId);
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load depreciation statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load depreciation data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-green-100 animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">
            No depreciation data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Use utility functions for calculations
  const depreciationPercentage = getDepreciationPercentage(
    stats.totalDepreciation,
    stats.totalPurchaseValue,
  );
  const valueRetentionPercentage = getValueRetentionPercentage(
    stats.totalCurrentValue,
    stats.totalPurchaseValue,
  );

  // Placeholder for dynamic values (to be replaced with real data/API)
  const totalAssets = stats.totalPurchaseValue
    ? Math.round(stats.totalPurchaseValue / 1000)
    : 0; // Example logic
  const averageAge = 2.5; // TODO: Replace with real value from API or stats

  // Prepare data for AssetBarChart
  const depreciationMethodColors: Record<string, string> = {
    "Straight-Line": "#2563eb",
    "Declining Balance": "#f59e42",
    "Units of Production": "#16a34a",
    "Sum-of-the-Years'-Digits": "#dc2626",
  };
  const depreciationMethodData = Object.entries(
    stats.assetsByDepreciationMethod || {},
  ).map(([name, value]) => ({
    name,
    value,
    color: depreciationMethodColors[name] || "#64748b",
  }));

  return (
    <div className="space-y-6 relative">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg font-semibold text-gray-800 cursor-help">
                    Total Asset Value
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                  Sum of all asset purchase prices
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DollarSign className="h-6 w-6 text-green-500" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter value={stats.totalPurchaseValue} decimals={0} />
            <p className="text-xs text-gray-500 mt-1">
              Original purchase value
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg font-semibold text-gray-800 cursor-help">
                    Current Value
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                  Estimated current value after depreciation
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <BarChart3 className="h-6 w-6 text-blue-500" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter value={stats.totalCurrentValue} decimals={0} />
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(valueRetentionPercentage)} of original value
            </p>
            <Progress value={valueRetentionPercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg font-semibold text-gray-800 cursor-help">
                    Total Depreciation
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                  Total value lost to depreciation
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TrendingDown className="h-6 w-6 text-red-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-600">
              <AnimatedCounter value={stats.totalDepreciation} decimals={0} />
            </span>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(depreciationPercentage)} depreciation
            </p>
            <Progress value={depreciationPercentage} className="mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-lg rounded-xl border-0 bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className="text-lg font-semibold text-gray-800 cursor-help">
                    Replacement Alerts
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent>Assets needing replacement soon</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-orange-600">
              <AnimatedCounter
                value={stats.assetsNeedingReplacement}
                decimals={0}
              />
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Assets needing replacement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Depreciation Methods Distribution */}
        <Card className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow">
          <CardHeader className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              Depreciation Methods
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-0 h-5 w-5">
                    <Info className="h-4 w-4 text-blue-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs">
                  <h4 className="font-semibold mb-2">
                    About Depreciation Methods
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      <b>Straight-Line:</b> Spreads the asset&apos;s cost evenly
                      over its useful life.
                    </li>

                    <li>
                      <b>Declining Balance:</b> Accelerates depreciation, with
                      more expense in early years.
                    </li>

                    <li>
                      <b>Units of Production:</b> Based on asset usage or
                      output, not time.
                    </li>

                    <li>
                      <b>Sum-of-the-Years&apos;-Digits:</b> Another accelerated
                      method, decreasing each year.
                    </li>
                  </ul>
                </PopoverContent>
              </Popover>
            </CardTitle>
            <CardContent className="text-sm text-muted-foreground">
              Distribution of assets by depreciation calculation method
            </CardContent>
          </CardHeader>
          <CardContent>
            <AssetBarChart data={depreciationMethodData} />
          </CardContent>
        </Card>
        {/* Depreciation Insights */}
        <Card className="shadow-lg rounded-xl border-0 bg-white hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Depreciation Insights</CardTitle>
            <CardContent className="text-sm text-muted-foreground">
              Key metrics and trends
            </CardContent>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Average Depreciation Rate
                  </span>
                </div>
                <span className="text-lg font-bold text-green-800">
                  <AnimatedCounter
                    value={stats.averageDepreciationRate}
                    decimals={1}
                  />
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Assets Near End of Life
                  </span>
                </div>
                <span className="text-lg font-bold text-orange-800">
                  <AnimatedCounter
                    value={stats.assetsNeedingReplacement}
                    decimals={0}
                  />
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Value Retention
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-800">
                  <AnimatedCounter
                    value={valueRetentionPercentage}
                    decimals={1}
                  />
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow rounded-xl border-0 bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={loadDepreciationStats}
              variant="outline"
              size="sm"
              className="w-full hover:bg-accent/30"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalculate All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-accent/30"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-accent/30"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              View Alerts
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow rounded-xl border-0 bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Portfolio Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Assets:</span>
                <span className="font-medium">{totalAssets}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Age:</span>
                <span className="font-medium">{averageAge} years</span>
              </div>
              <div className="flex justify-between">
                <span>Depreciation Method:</span>
                <span className="font-medium">Auto-selected</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow rounded-xl border-0 bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Next Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Review replacement candidates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Update depreciation rates</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Schedule annual review</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          onClick={loadDepreciationStats}
          variant="outline"
          className="hover:bg-accent/30"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Depreciation Data
        </Button>
      </div>

      {/* Floating Info Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-6 right-6 z-50 shadow-lg"
          >
            <Info className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <h4 className="font-semibold mb-2">Depreciation Methodology</h4>
          <p className="text-sm text-muted-foreground">
            This dashboard uses multiple depreciation methods. You can select a
            method per asset, or let the system auto-select the most appropriate
            one. Hover over metrics for more info.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
