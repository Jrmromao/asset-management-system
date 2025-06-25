"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Target,
  Zap,
  Leaf,
  TrendingUp,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SustainabilityTargets {
  targetEnergy: number | null;
  targetCarbonReduction: number | null;
}

interface TargetProgress {
  currentEnergy: number;
  currentCarbon: number;
  energyProgress: number;
  carbonProgress: number;
  lastUpdated: Date;
}

const SustainabilityTargets = () => {
  const [targets, setTargets] = useState<SustainabilityTargets>({
    targetEnergy: null,
    targetCarbonReduction: null,
  });
  const [progress, setProgress] = useState<TargetProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load current targets and progress
  const loadTargets = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual API calls
      // const response = await fetch('/api/company/sustainability-targets');
      // const data = await response.json();
      
      // Mock data for now
      const mockTargets = {
        targetEnergy: 10000,
        targetCarbonReduction: 100,
      };
      
      const mockProgress = {
        currentEnergy: 8500,
        currentCarbon: 75,
        energyProgress: 85,
        carbonProgress: 75,
        lastUpdated: new Date(),
      };
      
      setTargets(mockTargets);
      setProgress(mockProgress);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sustainability targets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save targets
  const saveTargets = async () => {
    setIsSaving(true);
    try {
      // This would be replaced with actual API call
      // const response = await fetch('/api/company/sustainability-targets', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(targets),
      // });
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Sustainability targets updated successfully",
      });
      
      setHasChanges(false);
      await loadTargets(); // Reload to get updated progress
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save sustainability targets",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes
  const handleTargetChange = (field: keyof SustainabilityTargets, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    setTargets(prev => ({
      ...prev,
      [field]: numericValue,
    }));
    setHasChanges(true);
  };

  // Load data on component mount
  useEffect(() => {
    loadTargets();
  }, []);

  // Calculate progress status
  const getProgressStatus = (progress: number) => {
    if (progress >= 90) return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle, label: 'Excellent' };
    if (progress >= 70) return { color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp, label: 'On Track' };
    if (progress >= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-50', icon: AlertTriangle, label: 'Behind' };
    return { color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle, label: 'Critical' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
            <Target className="w-6 h-6 text-slate-700" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sustainability Targets
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Set and track your organization's energy efficiency and carbon reduction goals
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      {progress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">Energy Efficiency</CardTitle>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressStatus(progress.energyProgress).bg} ${getProgressStatus(progress.energyProgress).color}`}>
                  {getProgressStatus(progress.energyProgress).label}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{progress.currentEnergy.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">kWh current usage</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-600">{progress.energyProgress}%</p>
                    <p className="text-xs text-gray-500">of target</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress.energyProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Target: {targets.targetEnergy?.toLocaleString() || 'Not set'} kWh
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-lg">Carbon Reduction</CardTitle>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressStatus(progress.carbonProgress).bg} ${getProgressStatus(progress.carbonProgress).color}`}>
                  {getProgressStatus(progress.carbonProgress).label}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{progress.currentCarbon}</p>
                    <p className="text-sm text-gray-600">tons CO2e saved</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-emerald-600">{progress.carbonProgress}%</p>
                    <p className="text-xs text-gray-500">of target</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress.carbonProgress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Target: {targets.targetCarbonReduction?.toLocaleString() || 'Not set'} tons CO2e
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Target Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <CardTitle>Configure Targets</CardTitle>
                <CardDescription>
                  Set your annual sustainability goals and track progress
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={saveTargets}
              disabled={!hasChanges || isSaving}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Targets
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="energy-target" className="flex items-center gap-2 text-sm font-medium">
                <Zap className="w-4 h-4 text-blue-600" />
                Annual Energy Target (kWh)
              </Label>
              <Input
                id="energy-target"
                type="number"
                min="0"
                step="100"
                value={targets.targetEnergy || ''}
                onChange={(e) => handleTargetChange('targetEnergy', e.target.value)}
                placeholder="e.g., 10000"
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Set your annual energy consumption target in kilowatt-hours
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="carbon-target" className="flex items-center gap-2 text-sm font-medium">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Annual Carbon Reduction Target (tons CO2e)
              </Label>
              <Input
                id="carbon-target"
                type="number"
                min="0"
                step="1"
                value={targets.targetCarbonReduction || ''}
                onChange={(e) => handleTargetChange('targetCarbonReduction', e.target.value)}
                placeholder="e.g., 100"
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Set your annual carbon reduction goal in tons of CO2 equivalent
              </p>
            </div>
          </div>

          {hasChanges && (
            <Alert className="border-amber-200 bg-amber-50">
              <Info className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You have unsaved changes. Click "Save Targets" to apply your new sustainability goals.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>
                Tips for setting effective sustainability targets
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Energy Efficiency
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Base targets on historical consumption data</li>
                <li>• Consider seasonal variations in usage</li>
                <li>• Account for business growth projections</li>
                <li>• Set achievable 5-15% annual reductions</li>
                <li>• Regular monitoring and adjustments</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                Carbon Reduction
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Align with science-based targets (SBTi)</li>
                <li>• Focus on Scope 1, 2, and key Scope 3 emissions</li>
                <li>• Consider carbon offset strategies</li>
                <li>• Plan for technology and process improvements</li>
                <li>• Track progress monthly for better results</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SustainabilityTargets; 