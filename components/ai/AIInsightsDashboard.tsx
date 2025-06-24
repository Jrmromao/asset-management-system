"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Brain,
  Zap,
  Eye,
  Activity,
  PieChart,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface AssetInsight {
  id: string;
  type: 'utilization' | 'lifecycle' | 'performance' | 'cost' | 'maintenance';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  recommendation: string;
  affectedAssets: number;
  potentialSavings?: number;
  timeframe: string;
}

interface UtilizationMetric {
  category: string;
  utilized: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  value: number;
}

interface LifecyclePrediction {
  assetId: string;
  assetName: string;
  currentAge: number;
  predictedRemainingLife: number;
  replacementRecommendation: {
    timeframe: string;
    confidence: number;
    reasoning: string;
  };
}

interface AIAnalyticsData {
  insights: AssetInsight[];
  utilization: UtilizationMetric[];
  lifecycle: LifecyclePrediction[];
  anomalies: Array<{
    id: string;
    assetName: string;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    detectedAt: string;
  }>;
  summary: {
    totalAssets: number;
    activeAssets: number;
    utilizationRate: number;
    costOptimizationOpportunities: number;
    maintenanceAlerts: number;
  };
}

export function AIInsightsDashboard() {
  const { user } = useUser();
  const [data, setData] = useState<AIAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const runAnalysis = async () => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: 'comprehensive',
          includeUtilization: true,
          includeLifecycle: true,
          includeAnomalies: true
        }),
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        toast.success(`AI analysis complete! Generated ${result.data.insights.length} insights.`);
      } else {
        toast.error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to run AI analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Asset Insights
          </h2>
          <p className="text-gray-600">
            Deep analytics and intelligent recommendations for your asset portfolio
          </p>
        </div>
        
        <Button
          onClick={runAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>

      {!data && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for AI Analysis</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Click "Run AI Analysis" to generate intelligent insights about your assets, 
              utilization patterns, and optimization opportunities.
            </p>
            <Button onClick={runAnalysis} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Assets</p>
                    <p className="text-2xl font-bold">{data.summary.totalAssets}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {data.summary.utilizationRate}%
                    </p>
                  </div>
                  <PieChart className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Assets</p>
                    <p className="text-2xl font-bold text-blue-600">{data.summary.activeAssets}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cost Opportunities</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {data.summary.costOptimizationOpportunities}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Maintenance Alerts</p>
                    <p className="text-2xl font-bold text-red-600">{data.summary.maintenanceAlerts}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="utilization">Utilization</TabsTrigger>
              <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Key Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.insights.slice(0, 5).map((insight) => (
                      <div
                        key={insight.id}
                        className="flex items-start justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{insight.title}</h4>
                            <Badge className={getSeverityColor(insight.severity)}>
                              {insight.severity}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
                          <p className="text-blue-600 text-sm font-medium">
                            💡 {insight.recommendation}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Affects {insight.affectedAssets} assets</span>
                            <span>Impact: {insight.impact}/10</span>
                            {insight.potentialSavings && (
                              <span className="text-green-600 font-medium">
                                Potential savings: ${insight.potentialSavings.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="utilization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Utilization Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.utilization.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{metric.category}</span>
                            {getTrendIcon(metric.trend)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {metric.utilized}/{metric.total} ({metric.value}%)
                          </span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="lifecycle" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Lifecycle Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.lifecycle.slice(0, 5).map((prediction) => (
                      <div
                        key={prediction.assetId}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold">{prediction.assetName}</h4>
                          <p className="text-sm text-gray-600">
                            Age: {prediction.currentAge} years | 
                            Remaining: {prediction.predictedRemainingLife} years
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {prediction.replacementRecommendation.reasoning}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            {prediction.replacementRecommendation.confidence}% confidence
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {prediction.replacementRecommendation.timeframe}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="anomalies" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Detected Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.anomalies.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Anomalies Detected</h3>
                      <p className="text-gray-600">
                        Your assets are operating within normal parameters.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.anomalies.map((anomaly) => (
                        <div
                          key={anomaly.id}
                          className="flex items-start justify-between p-4 border rounded-lg"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{anomaly.assetName}</h4>
                              <Badge className={getSeverityColor(anomaly.severity)}>
                                {anomaly.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              Type: {anomaly.anomalyType}
                            </p>
                            <p className="text-sm">{anomaly.description}</p>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            {new Date(anomaly.detectedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 