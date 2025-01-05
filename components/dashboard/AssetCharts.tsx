// components/AssetCharts.tsx
import { BarChart, LineChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssetChartsProps {
  assets: Asset[];
}

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
