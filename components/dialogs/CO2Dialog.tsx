import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Leaf, Zap, Truck, Recycle, Factory, Save, RefreshCw, X, Edit, Loader2 } from "lucide-react";
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
  const [currentResult, setCurrentResult] = useState<CO2CalculationResult>(initialResult);
  const [isEditing, setIsEditing] = useState(isNewCalculation);
  const [refinementParams, setRefinementParams] = useState<RefinementParams>({
    lifespan: 4,
    energyConsumption: 100,
    transportDistance: 1000,
    manufacturingComplexity: "medium"
  });

  useEffect(() => {
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
          description: "CO2 footprint has been recalculated with refined parameters.",
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
    if (value === "N/A" || typeof value !== 'number') return "N/A";
    return `${value.toFixed(2)} kg CO2e`;
  };

  const getImpactLevel = (value: number) => {
    if (value > 1000) return { color: "bg-red-500", label: "High Impact" };
    if (value > 500) return { color: "bg-yellow-500", label: "Medium Impact" };
    return { color: "bg-green-500", label: "Low Impact" };
  };

  const impact = getImpactLevel(currentResult.totalCo2e);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            {isNewCalculation ? "CO2 Footprint Calculation" : "CO2 Footprint Details"}
          </DialogTitle>
          <DialogDescription>
            {isNewCalculation 
              ? `Review and refine the CO2 footprint calculation for ${assetName}`
              : `CO2 footprint details for ${assetName}`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="relative">
            {isRecalculating && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center z-10 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Updating calculation...
                </p>
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>CO2 Footprint Result</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg">
                    {formatCO2e(currentResult.totalCo2e)}
                  </Badge>
                  <div className={`w-3 h-3 rounded-full ${impact.color}`} />
                  <span className="text-sm text-gray-500">{impact.label}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confidence Score:</span>
                  <span className="text-sm font-medium">
                    {(currentResult.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={currentResult.confidenceScore * 100} 
                  className="h-2"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
                    <Factory className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">Manufacturing</div>
                      <div className="font-medium">{formatCO2e(currentResult.lifecycleBreakdown.manufacturing)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-orange-50 rounded">
                    <Truck className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">Transport</div>
                      <div className="font-medium">{formatCO2e(currentResult.lifecycleBreakdown.transport)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
                    <Zap className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">Use Phase</div>
                      <div className="font-medium">{formatCO2e(currentResult.lifecycleBreakdown.use)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded">
                    <Recycle className="h-4 w-4 text-purple-600" />
                    <div>
                      <div className="text-xs text-muted-foreground">End of Life</div>
                      <div className="font-medium">{formatCO2e(currentResult.lifecycleBreakdown.endOfLife)}</div>
                    </div>
                  </div>
                </div>

                {currentResult.description && (
                  <div className="text-sm text-muted-foreground pt-2">
                    <strong>Methodology:</strong> {currentResult.description}
                  </div>
                )}

                {currentResult.sources && currentResult.sources.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="font-medium text-sm">Sources:</h4>
                    <div className="space-y-1">
                      {currentResult.sources.map((source, index) => (
                        <a 
                          href={source.url} 
                          key={index} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-blue-600 hover:underline block"
                        >
                          • {source.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Parameter Refinement - Only show for new calculations or when editing */}
          {(isNewCalculation || isEditing) && (
            <>
              <Separator />
              <Card>
                <CardHeader>
                  <CardTitle>Refine Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lifespan">Expected Lifespan (years)</Label>
                      <Input
                        id="lifespan"
                        type="number"
                        value={refinementParams.lifespan}
                        onChange={(e) => setRefinementParams(prev => ({
                          ...prev,
                          lifespan: Number(e.target.value)
                        }))}
                        min="1"
                        max="20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="energy">Annual Energy Consumption (kWh)</Label>
                      <Input
                        id="energy"
                        type="number"
                        value={refinementParams.energyConsumption}
                        onChange={(e) => setRefinementParams(prev => ({
                          ...prev,
                          energyConsumption: Number(e.target.value)
                        }))}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transport">Transport Distance (km)</Label>
                      <Input
                        id="transport"
                        type="number"
                        value={refinementParams.transportDistance}
                        onChange={(e) => setRefinementParams(prev => ({
                          ...prev,
                          transportDistance: Number(e.target.value)
                        }))}
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complexity">Manufacturing Complexity</Label>
                      <select
                        id="complexity"
                        value={refinementParams.manufacturingComplexity}
                        onChange={(e) => setRefinementParams(prev => ({
                          ...prev,
                          manufacturingComplexity: e.target.value as "low" | "medium" | "high"
                        }))}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            {!isNewCalculation && !isEditing && (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            
            {(isNewCalculation || isEditing) && (
              <>
                <Button 
                  onClick={handleRecalculate}
                  disabled={isRecalculating}
                  variant="outline"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRecalculating ? 'animate-spin' : ''}`} />
                  {isRecalculating ? 'Recalculating...' : 'Recalculate'}
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Result
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CO2Dialog; 