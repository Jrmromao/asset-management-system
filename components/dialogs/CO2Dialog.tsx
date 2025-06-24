import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Leaf,
  Zap,
  Truck,
  Recycle,
  Factory,
  Save,
  RefreshCw,
  X,
  Edit,
  Loader2,
  Target,
  BarChart3,
  Globe,
} from "lucide-react";
import { CO2CalculationResult } from "@/types/co2";
import {
  calculateAssetCO2Action,
  saveAssetCO2Action,
} from "@/lib/actions/co2.actions";
import { useToast } from "@/hooks/use-toast";

interface CO2DialogProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
  initialResult: CO2CalculationResult;
  isNewCalculation?: boolean;
  onSave?: (result: CO2CalculationResult) => void;
}

interface RefinementParams {
  lifespan: number;
  energyConsumption: number;
  transportDistance: number;
  manufacturingComplexity: "low" | "medium" | "high";
}

const CO2Dialog: React.FC<CO2DialogProps> = ({
  isOpen,
  onClose,
  assetId,
  assetName,
  initialResult,
  isNewCalculation = false,
  onSave,
}) => {
  const { toast } = useToast();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [currentResult, setCurrentResult] =
    useState<CO2CalculationResult>(initialResult);
  const [isEditing, setIsEditing] = useState(isNewCalculation);
  const [refinementParams, setRefinementParams] = useState<RefinementParams>({
    lifespan: 4,
    energyConsumption: 100,
    transportDistance: 1000,
    manufacturingComplexity: "medium",
  });

  useEffect(() => {
    console.log("🔍 CO2Dialog received initialResult:", initialResult);
    console.log("🔍 CO2Dialog initialResult type:", typeof initialResult);
    console.log(
      "🔍 CO2Dialog initialResult keys:",
      initialResult ? Object.keys(initialResult) : "no data",
    );
    console.log("🔍 CO2Dialog scope breakdown:", initialResult?.scopeBreakdown);
    console.log(
      "🔍 CO2Dialog scope breakdown type:",
      typeof initialResult?.scopeBreakdown,
    );
    console.log(
      "🔍 CO2Dialog scope breakdown JSON:",
      JSON.stringify(initialResult?.scopeBreakdown, null, 2),
    );
    console.log("🔍 CO2Dialog scope totals:", {
      scope1: initialResult?.scopeBreakdown?.scope1?.total,
      scope2: initialResult?.scopeBreakdown?.scope2?.total,
      scope3: initialResult?.scopeBreakdown?.scope3?.total,
    });
    console.log("🔍 CO2Dialog isNewCalculation:", isNewCalculation);
    setCurrentResult(initialResult);
    setIsEditing(isNewCalculation);
  }, [initialResult, isNewCalculation]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const result = await calculateAssetCO2Action(assetId);
      if (result.success && "data" in result && result.data) {
        setCurrentResult(result.data);
        toast({
          title: "Recalculation Complete",
          description:
            "CO2 footprint has been recalculated with refined parameters.",
        });
      } else {
        toast({
          title: "Recalculation Failed",
          description: result.error || "Failed to recalculate CO2 footprint",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during recalculation",
        variant: "destructive",
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSave = async () => {
    const result = await saveAssetCO2Action(assetId, currentResult);
    if (result.success) {
      toast({
        title: "CO2 Data Saved",
        description: "The CO2 footprint data has been saved to the database.",
      });
      onSave?.(currentResult);
    } else {
      toast({
        title: "Save Failed",
        description: result.error || "Failed to save CO2 footprint",
        variant: "destructive",
      });
    }
  };

  const formatCO2e = (value: number | "N/A") => {
    if (value === "N/A" || typeof value !== "number") return "N/A";
    return `${value.toFixed(2)} kg CO2e`;
  };

  const getImpactLevel = (value: number) => {
    if (value > 1000) return { color: "bg-red-500", label: "High Impact" };
    if (value > 500) return { color: "bg-yellow-500", label: "Medium Impact" };
    return { color: "bg-green-500", label: "Low Impact" };
  };

  const impact = getImpactLevel(currentResult.totalCo2e);

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
        return "bg-red-50 border-red-200";
      case 2:
        return "bg-orange-50 border-orange-200";
      case 3:
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getScopeDescription = (scope: number) => {
    switch (scope) {
      case 1:
        return "Direct emissions from owned/controlled sources";
      case 2:
        return "Indirect emissions from purchased electricity";
      case 3:
        return "All other indirect emissions in value chain";
      default:
        return "Unknown scope classification";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            CO2 Footprint Analysis
          </DialogTitle>
          <DialogDescription>
            Comprehensive carbon footprint analysis for {assetName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scopes">GHG Scopes</TabsTrigger>
            <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Total CO2e */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Carbon Footprint
                    </p>
                    <p className="text-3xl font-bold text-green-600">
                      {currentResult.totalCo2e} {currentResult.units}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Primary Scope
                    </p>
                    <div className="flex items-center gap-2">
                      {getScopeIcon(currentResult.primaryScope)}
                      <Badge
                        variant="outline"
                        className={getScopeColor(currentResult.primaryScope)}
                      >
                        Scope {currentResult.primaryScope}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Confidence Score
                    </span>
                    <span className="text-sm font-medium">
                      {(currentResult.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={currentResult.confidenceScore * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Based on {currentResult.sources?.length || 0} data sources
                    and {currentResult.methodology}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scopes" className="space-y-4">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scope 1 */}
              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Factory className="h-4 w-4 text-red-600" />
                    Scope 1: Direct
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {currentResult.scopeBreakdown?.scope1?.total || 0} kg CO2e
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getScopeDescription(1)}
                  </p>
                  <div className="mt-3 space-y-1">
                    {Object.entries(
                      currentResult.scopeBreakdown?.scope1?.categories || {},
                    ).map(([key, value]) =>
                      value > 0 ? (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span>{value} kg</span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Scope 2 */}
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-orange-600" />
                    Scope 2: Energy Indirect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">
                    {currentResult.scopeBreakdown?.scope2?.total || 0} kg CO2e
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getScopeDescription(2)}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Location-based</span>
                      <span>
                        {currentResult.scopeBreakdown?.scope2?.locationBased ||
                          0}{" "}
                        kg
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Market-based</span>
                      <span>
                        {currentResult.scopeBreakdown?.scope2?.marketBased || 0}{" "}
                        kg
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scope 3 */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-blue-600" />
                    Scope 3: Other Indirect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600">
                    {currentResult.scopeBreakdown?.scope3?.total || 0} kg CO2e
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getScopeDescription(3)}
                  </p>
                  <div className="mt-3 space-y-1 max-h-20 overflow-y-auto">
                    {Object.entries(
                      currentResult.scopeBreakdown?.scope3?.categories || {},
                    ).map(([key, value]) =>
                      value > 0 ? (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="capitalize">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span>{value} kg</span>
                        </div>
                      ) : null,
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Primary Scope Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  Primary Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {getScopeIcon(currentResult.primaryScope)}
                  <div>
                    <p className="font-medium">
                      Scope {currentResult.primaryScope}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentResult.primaryScopeCategory}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifecycle" className="space-y-4">
            {/* Lifecycle Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border">
                <Factory className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    Manufacturing
                  </div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleBreakdown.manufacturing)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded border">
                <Truck className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Transport</div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleBreakdown.transport)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded border">
                <Zap className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Use Phase</div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleBreakdown.use)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded border">
                <Recycle className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    End of Life
                  </div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleBreakdown.endOfLife)}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Data */}
            {currentResult.activityData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Activity Data Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {currentResult.activityData.weight && (
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium ml-2">
                          {currentResult.activityData.weight} kg
                        </span>
                      </div>
                    )}
                    {currentResult.activityData.energyConsumption && (
                      <div>
                        <span className="text-muted-foreground">Energy:</span>
                        <span className="font-medium ml-2">
                          {currentResult.activityData.energyConsumption}{" "}
                          kWh/year
                        </span>
                      </div>
                    )}
                    {currentResult.activityData.expectedLifespan && (
                      <div>
                        <span className="text-muted-foreground">Lifespan:</span>
                        <span className="font-medium ml-2">
                          {currentResult.activityData.expectedLifespan} years
                        </span>
                      </div>
                    )}
                    {currentResult.activityData.transportDistance && (
                      <div>
                        <span className="text-muted-foreground">
                          Transport:
                        </span>
                        <span className="font-medium ml-2">
                          {currentResult.activityData.transportDistance} km
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={isRecalculating}
            >
              {isRecalculating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Recalculate
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            {isNewCalculation && (
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Results
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CO2Dialog;
