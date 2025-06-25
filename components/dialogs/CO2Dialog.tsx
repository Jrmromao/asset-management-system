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
  CheckCircle,
  Info,
} from "lucide-react";
import { CO2CalculationResult } from "@/types/co2";
import { saveAssetCO2Action } from "@/lib/actions/co2.actions";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

interface CO2DialogProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  assetName: string;
  initialResult: CO2CalculationResult;
  isNewCalculation?: boolean;
  onSave?: (result: CO2CalculationResult) => void;
  manufacturerName?: string;
  manufacturerUrl?: string;
  manufacturerSupportUrl?: string;
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
  manufacturerName,
  manufacturerUrl,
  manufacturerSupportUrl,
}) => {
  const { toast } = useToast();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [currentResult, setCurrentResult] =
    useState<CO2CalculationResult>(initialResult);
  const [isEditing, setIsEditing] = useState(isNewCalculation);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [refinementParams, setRefinementParams] = useState<RefinementParams>({
    lifespan: 4,
    energyConsumption: 100,
    transportDistance: 1000,
    manufacturingComplexity: "medium",
  });

  useEffect(() => {
    setCurrentResult(initialResult);
    setIsEditing(isNewCalculation);
    setIsUnsaved(false);
  }, [initialResult, isNewCalculation]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const response = await fetch("/api/co2/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assetId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCurrentResult(result.data);
        setIsUnsaved(true);
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
      setIsUnsaved(false);
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
          {manufacturerName && (manufacturerUrl || manufacturerSupportUrl) && (
            <div className="mt-2 flex flex-wrap gap-4 items-center text-sm">
              <span className="font-medium">Manufacturer:</span>
              <span className="font-semibold text-gray-900">{manufacturerName}</span>
              {manufacturerUrl && (
                <a
                  href={manufacturerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Website
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" /></svg>
                </a>
              )}
              {manufacturerSupportUrl && (
                <a
                  href={manufacturerSupportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  Support
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3h7m0 0v7m0-7L10 14m-7 7h7a2 2 0 002-2v-7" /></svg>
                </a>
              )}
            </div>
          )}
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
               
                    {/* Amortized Values */}
                    {typeof currentResult.amortizedAnnualCo2e === 'number' && (
                      <p className="text-sm text-blue-700 mt-2">
                        <strong>Amortized Annual CO2e:</strong> {currentResult.amortizedAnnualCo2e.toFixed(2)} {currentResult.units}/year
                      </p>
                    )}
                    {typeof currentResult.amortizedMonthlyCo2e === 'number' && (
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Amortized Monthly CO2e:</strong> {currentResult.amortizedMonthlyCo2e.toFixed(2)} {currentResult.units}/month
                      </p>
                    )}
                    {typeof currentResult.expectedLifespanYears === 'number' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Expected Lifespan:</strong> {currentResult.expectedLifespanYears} years
                      </p>
                    )}
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Progress
                            value={currentResult.confidenceScore * 100}
                            className="h-2"
                            indicatorClassName={
                              currentResult.confidenceScore < 0.6
                                ? 'bg-red-600'
                                : currentResult.confidenceScore < 0.8
                                ? 'bg-yellow-400'
                                : 'bg-green-600'
                            }
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>
                          This score reflects how much technical data was available for this calculation.<br/>
                          <b>Higher confidence</b> means more accurate and consistent results.<br/>
                          {currentResult.confidenceScore < 0.8 && (
                            <>
                              <br/><b>Tip:</b> Provide more technical details (e.g., energy consumption, weight, year, etc.) for higher accuracy.
                            </>
                          )}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-xs text-muted-foreground">
                    Based on {currentResult.sources?.length || 0} data sources
                    and {currentResult.methodology}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded text-sm">
              <strong>Tip:</strong> The more technical details you provide for this asset, the more accurate your CO2 calculation will be. If any information is missing, we'll use typical values for your asset type/model.
            </div>
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
    
            {/* Premium Lifecycle Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded border">
                <Factory className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-xs text-muted-foreground">
                    Manufacturing
                  </div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleManufacturing ?? currentResult.lifecycleBreakdown?.manufacturing)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded border">
                <Truck className="h-4 w-4 text-orange-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Transport</div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleTransport ?? currentResult.lifecycleBreakdown?.transport)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded border">
                <Zap className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-muted-foreground">Use Phase</div>
                  <div className="font-medium">
                    {formatCO2e(currentResult.lifecycleUse ?? currentResult.lifecycleBreakdown?.use)}
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
                    {formatCO2e(currentResult.lifecycleEndOfLife ?? currentResult.lifecycleBreakdown?.endOfLife)}
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
                  <TooltipProvider>
                    <div className="mb-2 text-xs text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </TooltipTrigger>
                          <TooltipContent>Provided by you</TooltipContent>
                        </Tooltip>
                        provided by you
                      </span>
                      <span className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>Typical/average value used</TooltipContent>
                        </Tooltip>
                        typical/average value used
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {typeof currentResult.activityData.weight !== 'undefined' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Weight:</span>
                          <span className={currentResult.activityData._userProvided?.weight ? "font-medium ml-2" : "font-medium ml-2 text-gray-500 italic"}>
                            {currentResult.activityData.weight} kg
                          </span>
                          {currentResult.activityData._userProvided?.weight ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>Provided by you</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>Typical/average value used</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                      {typeof currentResult.activityData.energyConsumption !== 'undefined' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Energy:</span>
                          <span className={currentResult.activityData._userProvided?.energyConsumption ? "font-medium ml-2" : "font-medium ml-2 text-gray-500 italic"}>
                            {currentResult.activityData.energyConsumption} kWh/year
                          </span>
                          {currentResult.activityData._userProvided?.energyConsumption ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>Provided by you</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>Typical/average value used</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                      {typeof currentResult.activityData.expectedLifespan !== 'undefined' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Lifespan:</span>
                          <span className={currentResult.activityData._userProvided?.expectedLifespan ? "font-medium ml-2" : "font-medium ml-2 text-gray-500 italic"}>
                            {currentResult.activityData.expectedLifespan} years
                          </span>
                          {currentResult.activityData._userProvided?.expectedLifespan ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>Provided by you</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>Typical/average value used</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                      {typeof currentResult.activityData.transportDistance !== 'undefined' && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Transport:</span>
                          <span className={currentResult.activityData._userProvided?.transportDistance ? "font-medium ml-2" : "font-medium ml-2 text-gray-500 italic"}>
                            {currentResult.activityData.transportDistance} km
                          </span>
                          {currentResult.activityData._userProvided?.transportDistance ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </TooltipTrigger>
                              <TooltipContent>Provided by you</TooltipContent>
                            </Tooltip>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-gray-400" />
                              </TooltipTrigger>
                              <TooltipContent>Typical/average value used</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="pt-4 border-t">
          {(!isNewCalculation && isUnsaved) && (
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-xs flex items-center gap-2 max-w-xl w-full justify-center">
                <Info className="h-4 w-4 text-yellow-600" />
                <span>Saving will override the previous CO2 calculation for this asset.</span>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center gap-2">
            <div>
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
              {(isUnsaved || isNewCalculation) && (
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Results
                </Button>
              )}
              <Button variant="outline" onClick={() => { setIsUnsaved(false); onClose(); }}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CO2Dialog;
