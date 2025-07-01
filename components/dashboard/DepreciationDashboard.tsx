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
} from "lucide-react";
import { calculatePortfolioDepreciation } from "@/lib/actions/depreciation.actions";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";

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
      const companyId = user?.publicMetadata?.companyId;
      if (!companyId) {
        toast({
          title: "Error",
          description: "No company ID found for this user.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const result = await calculatePortfolioDepreciation(String(companyId));      if (result.success && result.data) {
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
              <div className="h-8 bg-muted animate-pulse rounded" />
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
          <p className="text-muted-foreground">No depreciation data available</p>
        </CardContent>
      </Card>
    );
  }

  const depreciationPercentage = (stats.totalDepreciation / stats.totalPurchaseValue) * 100;
  const valueRetentionPercentage = (stats.totalCurrentValue / stats.totalPurchaseValue) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asset Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalPurchaseValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Original purchase value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalCurrentValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(valueRetentionPercentage)} of original value
            </p>
            <Progress value={valueRetentionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalDepreciation)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(depreciationPercentage)} depreciation
            </p>
            <Progress value={depreciationPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replacement Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.assetsNeedingReplacement}
            </div>
            <p className="text-xs text-muted-foreground">
              Assets needing replacement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Depreciation Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Depreciation Methods</CardTitle>
            <CardContent className="text-sm text-muted-foreground">
              Distribution of assets by depreciation calculation method
            </CardContent>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.assetsByDepreciationMethod).map(([method, count]) => (
                <div
                  key={method}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">{method}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {count} assets
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Depreciation Insights */}
        <Card>
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
                  {formatPercentage(stats.averageDepreciationRate)}
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
                  {stats.assetsNeedingReplacement}
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
                  {formatPercentage(valueRetentionPercentage)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={loadDepreciationStats} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recalculate All
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <BarChart3 className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              View Alerts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Portfolio Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Assets:</span>
                <span className="font-medium">Calculated</span>
              </div>
              <div className="flex justify-between">
                <span>Average Age:</span>
                <span className="font-medium">2.5 years</span>
              </div>
              <div className="flex justify-between">
                <span>Depreciation Method:</span>
                <span className="font-medium">Auto-selected</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
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
        <Button onClick={loadDepreciationStats} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Depreciation Data
        </Button>
      </div>
    </div>
  );
}