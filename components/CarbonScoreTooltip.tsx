import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Leaf } from "lucide-react";
import { getCO2ScoreInfo } from "@/lib/utils";

interface CarbonScoreTooltipProps {
  co2Score: number;
}

const CarbonScoreTooltip: React.FC<CarbonScoreTooltipProps> = ({
  co2Score,
}) => {
  const scoreInfo = getCO2ScoreInfo(co2Score);
  const BatteryIcon = scoreInfo.icon;

  const getComparisonPercentage = () => {
    if (!co2Score) return "-";
    return `${Math.round((co2Score / 75) * 100)}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 cursor-help
                                 ${scoreInfo.color} ${scoreInfo.bgColor}`}
          >
            <BatteryIcon className="w-4 h-4" />
            <span className="flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              CO₂ {co2Score.toLocaleString()} kg
            </span>
            <span className="font-medium">{scoreInfo.label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-white">
          <div className="space-y-2">
            <p className="font-medium">{scoreInfo.label} Carbon Footprint</p>
            <p className="text-sm">{scoreInfo.description}</p>
            <div className="text-xs text-muted-foreground">
              <p>• Annual CO₂ emissions: {co2Score}kg</p>
              <p>• Compared to average: {getComparisonPercentage()}%</p>
              <p>• Environmental impact: {scoreInfo.label.toLowerCase()}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CarbonScoreTooltip;
