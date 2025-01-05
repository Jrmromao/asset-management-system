// components/AssetLifecycle.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AssetLifecycleProps {
  asset: Asset;
}

export const AssetLifecycle = ({ asset }: AssetLifecycleProps): JSX.Element => {
  const stages = ["new", "active", "maintenance", "retiring", "disposed"];
  // const currentStageIndex = stages.indexOf(asset.lifecycle.stage);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Lifecycle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-between mb-2">
            {stages.map((stage, index) => (
              <div
                key={stage}
                className={`text-sm ${
                  index <= 3 ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                {stage}
              </div>
            ))}
          </div>

          {/*<Progress*/}
          {/*  value={(currentStageIndex / (stages.length - 1)) * 100}*/}
          {/*  className="h-2"*/}
          {/*/>*/}
          <Progress value={(30 / (stages.length - 1)) * 100} className="h-2" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Age</span>
              <p className="font-medium">
                {/*{asset.lifecycle.ageInMonths} months*/}4 months
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Health Score</span>
              <p className="font-medium">
                {
                  // {asset.lifecycle.healthScore}%
                }
                40%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
