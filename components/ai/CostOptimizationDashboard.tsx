"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Brain,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';

interface CostRecommendation {
  id: string;
  type: 'license' | 'accessory' | 'workflow';
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
  confidenceScore: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeToValue: number;
  affectedAssets: string[];
  actionItems: string[];
}

interface CostOptimizationAnalysis {
  totalPotentialSavings: number;
  recommendations: CostRecommendation[];
  riskAssessment: {
    overall: 'low' | 'medium' | 'high';
    factors: Array<{
      category: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      likelihood: number;
    }>;
    mitigationStrategies: string[];
  };
  implementationPriority: Array<{
    phase: number;
    title: string;
    duration: number;
    recommendations: string[];
    dependencies: string[];
    expectedSavings: number;
  }>;
}

export function CostOptimizationDashboard() {
  const { user } = useUser();
  const [analysis, setAnalysis] = useState<CostOptimizationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'licenses' | 'accessories'>('licenses');

  const runAnalysis = async (type: 'license' | 'accessory') => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    setActiveTab(type === 'license' ? 'licenses' : 'accessories');
    
    try {
      const response = await fetch('/api/ai/cost-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisType: type,
          timeframe: 'quarterly'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.data);
        toast.success(`AI analysis complete! Found ${result.data.recommendations.length} optimization opportunities.`);
      } else {
        toast.error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to run analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Cost Optimization
          </h2>
          <p className="text-gray-600">
            Intelligent recommendations to reduce costs and optimize spending
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => runAnalysis('license')}
            disabled={isLoading}
            variant={activeTab === 'licenses' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            {isLoading && activeTab === 'licenses' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Analyze Licenses
              </>
            )}
          </Button>
          <Button
            onClick={() => runAnalysis('accessory')}
            disabled={isLoading}
            variant={activeTab === 'accessories' ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            {isLoading && activeTab === 'accessories' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Analyze Accessories
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!analysis && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ready for Cost Analysis</h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Choose to analyze your licenses or accessories to discover cost optimization opportunities 
              powered by AI insights.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => runAnalysis('license')} className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Analyze Licenses
              </Button>
              <Button onClick={() => runAnalysis('accessory')} variant="outline" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Analyze Accessories
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Potential Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${analysis.totalPotentialSavings.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recommendations</p>
                    <p className="text-2xl font-bold">{analysis.recommendations.length}</p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Level</p>
                    <p className={`text-2xl font-bold ${getRiskColor(analysis.riskAssessment.overall)}`}>
                      {analysis.riskAssessment.overall.toUpperCase()}
                    </p>
                  </div>
                  <AlertTriangle className={`h-8 w-8 ${getRiskColor(analysis.riskAssessment.overall)}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Implementation Phases</p>
                    <p className="text-2xl font-bold">{analysis.implementationPriority.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Cost Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{rec.title}</h4>
                        <p className="text-gray-600 text-sm">{rec.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${rec.potentialSavings.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">potential savings</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{rec.description}</p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className={getEffortColor(rec.implementationEffort)}>
                        {rec.implementationEffort} effort
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <Progress value={rec.confidenceScore} className="w-20 h-2" />
                        <span className="text-sm font-medium">{rec.confidenceScore}%</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Time to value: {rec.timeToValue} days
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Action Items:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {rec.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {rec.affectedAssets.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          Affects {rec.affectedAssets.length} assets
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Implementation Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Implementation Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.implementationPriority.map((phase) => (
                  <div key={phase.phase} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        Phase {phase.phase}: {phase.title}
                      </h4>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${phase.expectedSavings.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{phase.duration} days</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {phase.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {phase.dependencies.length > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">Dependencies:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {phase.dependencies.map((dep, index) => (
                              <li key={index}>{dep}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-medium">Overall Risk Level:</span>
                  <Badge className={`${getRiskColor(analysis.riskAssessment.overall)} bg-opacity-10`}>
                    {analysis.riskAssessment.overall.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Risk Factors:</h4>
                    <div className="space-y-2">
                      {analysis.riskAssessment.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{factor.category}</p>
                            <p className="text-xs text-gray-600">{factor.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getRiskColor(factor.severity)} bg-opacity-10 text-xs`}>
                              {factor.severity}
                            </Badge>
                            <p className="text-xs text-gray-600">{factor.likelihood}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Mitigation Strategies:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                      {analysis.riskAssessment.mitigationStrategies.map((strategy, index) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 