"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CO2FootprintService, CO2FootprintStats } from "@/lib/services/co2Footprint.service";
import { Leaf, TrendingUp, TrendingDown, BarChart3, Users, Package } from "lucide-react";
import { withAuth } from "@/lib/middleware/withAuth";

interface CO2FootprintDashboardProps {
  companyId: string;
}

export function CO2FootprintDashboard({ companyId }: CO2FootprintDashboardProps) {
  const [stats, setStats] = useState<CO2FootprintStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, [companyId]);

  const loadStats = async () => {
    try {
      const response = await CO2FootprintService.getCO2FootprintStats(companyId);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load CO2 footprint statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <p className="text-muted-foreground">No CO2 data available</p>
        </CardContent>
      </Card>
    );
  }

  const coveragePercentage = (stats.assetsWithCO2 / stats.totalAssets) * 100;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total CO2e</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCO2e.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">
              Total carbon footprint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets with CO2 Data</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assetsWithCO2}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalAssets} total assets
            </p>
            <Progress value={coveragePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CO2e per Asset</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCO2ePerAsset.toFixed(1)} kg</div>
            <p className="text-xs text-muted-foreground">
              Per asset with data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coveragePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Assets with CO2 data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CO2 by Category */}
        <Card>
          <CardHeader>
            <CardTitle>CO2 by Category</CardTitle>
            <CardDescription>Carbon footprint breakdown by asset category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.co2ByCategory.map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">{category.category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.assetCount} assets
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {category.totalCO2e.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CO2 by Department */}
        <Card>
          <CardHeader>
            <CardTitle>CO2 by Department</CardTitle>
            <CardDescription>Carbon footprint breakdown by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.co2ByDepartment.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">{dept.department}</span>
                    <Badge variant="secondary" className="text-xs">
                      {dept.assetCount} assets
                    </Badge>
                  </div>
                  <span className="text-sm font-medium">
                    {dept.totalCO2e.toFixed(1)} kg
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Emitting Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Top Emitting Assets</CardTitle>
          <CardDescription>Assets with the highest carbon footprint</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topEmittingAssets.map((asset, index) => (
              <div key={asset.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{asset.name}</div>
                    <div className="text-sm text-muted-foreground">{asset.category}</div>
                  </div>
                </div>
                <Badge variant="destructive">
                  {asset.co2e.toFixed(1)} kg CO2e
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={loadStats} variant="outline">
          <TrendingUp className="mr-2 h-4 w-4" />
          Refresh CO2 Data
        </Button>
      </div>
    </div>
  );
} 