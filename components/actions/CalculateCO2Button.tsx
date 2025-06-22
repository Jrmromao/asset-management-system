"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { CO2CalculationResult } from "@/types/co2";
import { Leaf, Zap, Truck, Recycle, Factory, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { calculateAssetCO2Action } from "@/lib/actions/co2.actions";

interface CalculateCO2ButtonProps {
  assetId: string;
  assetName: string;
  onComplete?: (result: CO2CalculationResult) => void;
}

const CalculateCO2Button: React.FC<CalculateCO2ButtonProps> = ({
  assetId,
  assetName,
  onComplete,
}) => {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CO2CalculationResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCalculate = () => {
    startTransition(async () => {
      try {
        const result = await calculateAssetCO2Action(assetId);
        if (result.success && "data" in result && result.data) {
          toast({
            title: "CO2 Calculation Successful",
            description: `The CO2 footprint has been calculated.`,
          });
          onComplete?.(result.data);
          router.refresh();
        } else {
          toast({
            title: "CO2 Calculation Failed",
            description:
              "error" in result && result.error
                ? String(result.error)
                : "An unknown error occurred.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatCO2e = (value: number | "N/A") => {
    if (value === "N/A") return "N/A";
    return `${value} kg CO2e`;
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleCalculate}
        disabled={isPending}
        size="sm"
        variant="outline"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculating...
          </>
        ) : (
          "Calculate CO2"
        )}
      </Button>

      {showResult && result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              CO2 Footprint Results
            </CardTitle>
            <CardDescription>
              Lifecycle assessment for {assetName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Total CO2e */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Total CO2e:</span>
              <Badge variant="secondary" className="text-lg">
                {result.totalCo2e} kg CO2e
              </Badge>
            </div>

            {/* Confidence Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Confidence Score:</span>
                <span className="text-sm font-medium">
                  {(result.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
              <Progress 
                value={result.confidenceScore * 100} 
                className="h-2"
              />
            </div>

            {/* Lifecycle Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium">Lifecycle Breakdown:</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <Factory className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">Manufacturing</div>
                    <div className="font-medium">{formatCO2e(result.lifecycleBreakdown.manufacturing)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <Truck className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">Transport</div>
                    <div className="font-medium">{formatCO2e(result.lifecycleBreakdown.transport)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <Zap className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">Use Phase</div>
                    <div className="font-medium">{formatCO2e(result.lifecycleBreakdown.use)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <Recycle className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-xs text-muted-foreground">End of Life</div>
                    <div className="font-medium">{formatCO2e(result.lifecycleBreakdown.endOfLife)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {result.description && (
              <div className="text-sm text-muted-foreground">
                <strong>Methodology:</strong> {result.description}
              </div>
            )}

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Sources:</h4>
                <div className="space-y-1">
                  {result.sources.map((source: { name: string }, index: number) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      • {source.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalculateCO2Button; 