// components/EnvironmentalImpact.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Battery, Leaf, TrendingDown } from "lucide-react";

export const EnvironmentalImpactCard = () => {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Environmental Impact
          </CardTitle>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600">
            -12% vs Baseline
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Current CO₂</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">12.5</span>
                <span className="text-sm text-gray-500">tons</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Projected Savings</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-emerald-600">2.4</span>
                <span className="text-sm text-gray-500">tons/month</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Progress to Goal</span>
              <span className="font-medium">65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 p-3 rounded-lg">
              <Battery className="h-4 w-4 text-emerald-600 mb-1" />
              <div className="text-sm font-medium">Energy</div>
              <div className="text-xs text-gray-500">-15%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <TrendingDown className="h-4 w-4 text-emerald-600 mb-1" />
              <div className="text-sm font-medium">Waste</div>
              <div className="text-xs text-gray-500">-8%</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Leaf className="h-4 w-4 text-emerald-600 mb-1" />
              <div className="text-sm font-medium">Carbon</div>
              <div className="text-xs text-gray-500">-12%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
