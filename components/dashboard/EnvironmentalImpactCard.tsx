import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf } from "lucide-react";

interface EnvironmentalMetric {
  label: string;
  value: number;
  trend: number;
}

interface EnvironmentalImpactCardProps {
  metrics?: EnvironmentalMetric[];
  overallProgress?: number;
  targetDifference?: number;
}

const EnvironmentalImpactCard: FC<EnvironmentalImpactCardProps> = ({
  metrics = [
    {
      label: "Energy Usage",
      value: 88,
      trend: -12,
    },
    {
      label: "Carbon Impact",
      value: 85,
      trend: -15,
    },
    { label: "Efficiency", value: 92, trend: 92 },
  ],
  overallProgress = 85,
  targetDifference = 15,
}) => {
  return (
    <Card className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-emerald-50 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-medium">Environmental Impact</h3>
            <p className="text-sm text-gray-500">Monthly Overview</p>
          </div>
        </div>
        <Badge className="bg-emerald-50 text-emerald-600">
          {targetDifference}% below target
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="text-lg font-semibold mt-1">
              {metric.trend > 0 ? metric.trend : `${metric.trend}%`}
            </p>
            <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 ease-in-out"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Progress to Goal</span>
          <span className="font-medium">{overallProgress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 ease-in-out"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default EnvironmentalImpactCard;
