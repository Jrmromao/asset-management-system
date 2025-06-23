// components/AssetCharts.tsx
import { BarChart, LineChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, Zap, Globe, BarChart3 } from "lucide-react";

interface AssetChartsProps {
  assets: Asset[];
}

interface ScopeBreakdownProps {
  scopeData: {
    scope1: { total: number; percentage: number };
    scope2: { total: number; percentage: number };
    scope3: { total: number; percentage: number };
  };
}

const GHGScopeBreakdown: React.FC<ScopeBreakdownProps> = ({ scopeData }) => {
  const getScopeIcon = (scope: number) => {
    switch (scope) {
      case 1:
        return <Factory className="h-4 w-4 text-red-600" />;
      case 2:
        return <Zap className="h-4 w-4 text-orange-600" />;
      case 3:
        return <Globe className="h-4 w-4 text-blue-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScopeColor = (scope: number) => {
    switch (scope) {
      case 1:
        return "text-red-600 bg-red-50 border-red-200";
      case 2:
        return "text-orange-600 bg-orange-50 border-orange-200";
      case 3:
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          GHG Scope Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scope 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getScopeIcon(1)}
              <span className="text-sm font-medium">Scope 1: Direct</span>
            </div>
            <Badge variant="outline" className={getScopeColor(1)}>
              {scopeData.scope1.total.toFixed(1)} kg CO2e
            </Badge>
          </div>
          <Progress value={scopeData.scope1.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {scopeData.scope1.percentage.toFixed(1)}% of total emissions
          </p>
        </div>

        {/* Scope 2 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getScopeIcon(2)}
              <span className="text-sm font-medium">
                Scope 2: Energy Indirect
              </span>
            </div>
            <Badge variant="outline" className={getScopeColor(2)}>
              {scopeData.scope2.total.toFixed(1)} kg CO2e
            </Badge>
          </div>
          <Progress value={scopeData.scope2.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {scopeData.scope2.percentage.toFixed(1)}% of total emissions
          </p>
        </div>

        {/* Scope 3 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getScopeIcon(3)}
              <span className="text-sm font-medium">
                Scope 3: Other Indirect
              </span>
            </div>
            <Badge variant="outline" className={getScopeColor(3)}>
              {scopeData.scope3.total.toFixed(1)} kg CO2e
            </Badge>
          </div>
          <Progress value={scopeData.scope3.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {scopeData.scope3.percentage.toFixed(1)}% of total emissions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export const AssetCharts = ({ assets }: AssetChartsProps): JSX.Element => {
  // Calculate CO2 impact data
  const co2Data = assets.map((asset) => ({
    name: asset.name,
    impact: 1, //asset.co2Impact.current,
    savings: 1, //asset.co2Impact.savings,
  }));

  // Calculate usage trends
  const usageData = assets.map((asset) => ({
    name: asset.name,
    current: 0, //asset.usage.current,
    average: 0, //asset.usage.average,
    peak: 0, //asset.usage.peak,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>CO₂ Impact Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={co2Data} height={300}>
            {/* Chart configuration */}
          </LineChart>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={usageData} height={300}>
            {/* Chart configuration */}
          </BarChart>
        </CardContent>
      </Card>
    </div>
  );
};

export { GHGScopeBreakdown };
