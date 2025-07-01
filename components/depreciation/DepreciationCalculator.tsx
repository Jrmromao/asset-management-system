"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  RefreshCw,
  BarChart3,
  Brain,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { calculateAssetDepreciation, generateDepreciationSchedule, getMarketConditions } from "@/lib/actions/depreciation.actions";
import { Asset } from "@prisma/client";
import { MarketConditions } from "@/lib/utils/depreciation";

interface DepreciationCalculatorProps {
  asset: Asset & {
    category?: { name: string } | null;
    model?: { name: string } | null;
  };
  onUpdate?: () => void;
}

export function DepreciationCalculator({ asset, onUpdate }: DepreciationCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [depreciationData, setDepreciationData] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("auto");
  const [marketConditions, setMarketConditions] = useState<MarketConditions | null>(null);
  const [showMarketAdjustments, setShowMarketAdjustments] = useState(false);

  const handleCalculate = async (method: string = "auto") => {
    setIsCalculating(true);
    try {
      const result = await calculateAssetDepreciation(asset.id, method as any, undefined, marketConditions);
      if (result.success) {
        setDepreciationData(result.data);
        setSelectedMethod(method);
        onUpdate?.();
      }
    } catch (error) {
      console.error("Error calculating depreciation:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      const result = await generateDepreciationSchedule(asset.id, selectedMethod as any, marketConditions);
      if (result.success && result.data) {
        setSchedule(result.data.schedule);
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
    }
  };

  const handleLoadMarketConditions = async () => {
    try {
      const conditions = await getMarketConditions();
      setMarketConditions(conditions);
      setShowMarketAdjustments(true);
    } catch (error) {
      console.error("Error loading market conditions:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (error) {
      return "—";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Enhanced Depreciation Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Purchase Price</label>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Number(asset.purchasePrice) || 0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Value</label>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(Number(asset.currentValue) || 0)}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Depreciation</label>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency((Number(asset.purchasePrice) || 0) - (Number(asset.currentValue) || 0))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Remaining Life</label>
              <div className="text-2xl font-bold text-orange-600">
                {asset.expectedLifespan || "N/A"} years
              </div>
            </div>
          </div>

          {/* Market Conditions Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-800">Market Intelligence</h3>
              <Button
                onClick={handleLoadMarketConditions}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Load Market Data
              </Button>
            </div>
            
            {marketConditions && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tech Trend:</span>
                  <Badge variant="outline" className="ml-2">
                    {marketConditions.technologyTrend}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Industry:</span>
                  <Badge variant="outline" className="ml-2">
                    {marketConditions.industryGrowth}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Supply Chain:</span>
                  <Badge variant="outline" className="ml-2">
                    {marketConditions.supplyChainImpact}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Regulatory:</span>
                  <Badge variant="outline" className="ml-2">
                    {marketConditions.regulatoryChanges}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Economy:</span>
                  <Badge variant="outline" className="ml-2">
                    {marketConditions.economicConditions}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                onClick={() => handleCalculate("auto")}
                disabled={isCalculating}
                className="flex items-center gap-2"
              >
                {isCalculating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                AI Calculate
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleCalculate("straightLine")}
                disabled={isCalculating}
              >
                Straight Line
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleCalculate("decliningBalance")}
                disabled={isCalculating}
              >
                Declining Balance
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleCalculate("doubleDecliningBalance")}
                disabled={isCalculating}
              >
                Double Declining
              </Button>
            </div>

            {depreciationData && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Current Value</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(depreciationData.currentValue)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Method: {depreciationData.method}
                    </div>
                    {depreciationData.confidence && (
                      <div className="text-xs text-gray-400 mt-1">
                        Confidence: <span className={getConfidenceColor(depreciationData.confidence)}>
                          {(depreciationData.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Annual Depreciation</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(depreciationData.annualDepreciation)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPercentage(depreciationData.depreciationPercentage)} of original value
                    </div>
                    {depreciationData.marketAdjustments && (
                      <div className="text-xs text-blue-600 mt-1">
                        Market adjusted: {formatPercentage(depreciationData.marketAdjustments.multiplier * 100)}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Remaining Life</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {depreciationData.remainingLife.toFixed(1)} years
                    </div>
                    <div className="text-sm text-gray-500">
                      Next update: {formatDate(depreciationData.nextDepreciationDate)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {depreciationData && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Depreciation Progress</h3>
                  <Badge variant="secondary">
                    {formatPercentage(depreciationData.depreciationPercentage)}
                  </Badge>
                </div>
                <Progress 
                  value={Math.min(depreciationData.depreciationPercentage, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Purchase Date: {formatDate(asset.purchaseDate)}</span>
                  <span>Calculation Date: {formatDate(depreciationData.calculationDate)}</span>
                </div>
                
                {depreciationData.reasoning && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">AI Reasoning</span>
                    </div>
                    <p className="text-sm text-gray-600">{depreciationData.reasoning}</p>
                  </div>
                )}
              </div>
            )}

            {depreciationData && (
              <div className="mt-6">
                <Button
                  onClick={handleGenerateSchedule}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Generate Full Schedule
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Depreciation Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Year</th>
                    <th className="text-right p-2">Beginning Value</th>
                    <th className="text-right p-2">Depreciation</th>
                    <th className="text-right p-2">Ending Value</th>
                    <th className="text-right p-2">Accumulated</th>
                    {schedule.some(row => row.marketValue) && (
                      <th className="text-right p-2">Market Value</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{row.year}</td>
                      <td className="text-right p-2">{formatCurrency(row.beginningValue)}</td>
                      <td className="text-right p-2 text-red-600">{formatCurrency(row.depreciation)}</td>
                      <td className="text-right p-2">{formatCurrency(row.endingValue)}</td>
                      <td className="text-right p-2 text-gray-600">{formatCurrency(row.accumulatedDepreciation)}</td>
                      {row.marketValue && (
                        <td className="text-right p-2 text-blue-600">{formatCurrency(row.marketValue)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 