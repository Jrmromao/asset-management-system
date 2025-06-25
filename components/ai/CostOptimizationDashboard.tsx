"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Lightbulb,
  Target,
  Zap,
  Leaf,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface CostRecommendation {
  id: string;
  type: "license" | "accessory" | "workflow";
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
  confidenceScore: number;
  implementationEffort: "low" | "medium" | "high";
  timeToValue: number;
  affectedAssets: string[];
  actionItems: string[];
}

interface EnvironmentalImpact {
  totalCO2Emissions: number;
  emissionsByCategory: Array<{
    category: string;
    emissions: number;
    percentage: number;
  }>;
  potentialCO2Savings: number;
  carbonFootprintReduction: number;
  sustainabilityScore: number;
  recommendations: Array<{
    action: string;
    co2Reduction: number;
    costSavings: number;
    feasibility: "low" | "medium" | "high";
  }>;
}

interface CostOptimizationAnalysis {
  totalPotentialSavings: number;
  recommendations: CostRecommendation[];
  riskAssessment: {
    overall: "low" | "medium" | "high";
    factors: Array<{
      category: string;
      severity: "low" | "medium" | "high";
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
  environmentalImpact?: EnvironmentalImpact;
}

export function CostOptimizationDashboard() {
  const { user } = useUser();
  const [analysis, setAnalysis] = useState<CostOptimizationAnalysis | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"licenses" | "accessories">(
    "licenses",
  );

  const runAnalysis = async (type: "license" | "accessory") => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setIsLoading(true);
    setActiveTab(type === "license" ? "licenses" : "accessories");

    try {
      const response = await fetch("/api/ai/cost-optimization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisType: type,
          timeframe: "quarterly",
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setAnalysis(result.data);
        const recommendationCount = result.data.recommendations?.length || 0;
        toast.success(
          `AI analysis complete! Found ${recommendationCount} optimization opportunities.`,
        );
      } else {
        toast.error(result.error || "Analysis failed");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to run analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
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
            onClick={() => runAnalysis("license")}
            disabled={isLoading}
            variant={activeTab === "licenses" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isLoading && activeTab === "licenses" ? (
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
            onClick={() => runAnalysis("accessory")}
            disabled={isLoading}
            variant={activeTab === "accessories" ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            {isLoading && activeTab === "accessories" ? (
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
            <h3 className="text-lg font-semibold mb-2">
              Ready for Cost Analysis
            </h3>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Choose to analyze your licenses or accessories to discover cost
              optimization opportunities powered by AI insights.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => runAnalysis("license")}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Analyze Licenses
              </Button>
              <Button
                onClick={() => runAnalysis("accessory")}
                variant="outline"
                className="flex items-center gap-2"
              >
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
                    <p className="text-sm font-medium text-gray-600">
                      Potential Savings
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(analysis.totalPotentialSavings || 0).toLocaleString()}
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
                    <p className="text-sm font-medium text-gray-600">
                      Recommendations
                    </p>
                    <p className="text-2xl font-bold">
                      {analysis.recommendations?.length || 0}
                    </p>
                  </div>
                  <Lightbulb className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Risk Level
                    </p>
                    <p
                      className={`text-2xl font-bold ${getRiskColor(analysis.riskAssessment?.overall || "low")}`}
                    >
                      {(
                        analysis.riskAssessment?.overall || "low"
                      ).toUpperCase()}
                    </p>
                  </div>
                  <AlertTriangle
                    className={`h-8 w-8 ${getRiskColor(analysis.riskAssessment?.overall || "low")}`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Implementation Phases
                    </p>
                    <p className="text-2xl font-bold">
                      {analysis.implementationPriority?.length || 0}
                    </p>
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
                {(analysis.recommendations || []).map((rec) => (
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
                          ${(rec.potentialSavings || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          potential savings
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{rec.description}</p>

                    <div className="flex items-center gap-4 mb-3">
                      <Badge
                        className={getEffortColor(rec.implementationEffort)}
                      >
                        {rec.implementationEffort} effort
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">
                          Confidence:
                        </span>
                        <Progress
                          value={rec.confidenceScore || 0}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-medium">
                          {rec.confidenceScore || 0}%
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">
                        Time to value: {rec.timeToValue || 0} days
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">Action Items:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {(rec.actionItems || []).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {(rec.affectedAssets?.length || 0) > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          Affects {rec.affectedAssets?.length || 0} assets
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
                {(analysis.implementationPriority || []).map((phase) => (
                  <div key={phase.phase} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        Phase {phase.phase}: {phase.title}
                      </h4>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${(phase.expectedSavings || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {phase.duration || 0} days
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-sm mb-2">
                          Recommendations:
                        </h5>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {(phase.recommendations || []).map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      {(phase.dependencies?.length || 0) > 0 && (
                        <div>
                          <h5 className="font-medium text-sm mb-2">
                            Dependencies:
                          </h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {(phase.dependencies || []).map((dep, index) => (
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

          {/* Environmental Impact */}
          {analysis.environmentalImpact && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Environmental Impact & Sustainability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Total CO2 Emissions
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-800">
                        {(
                          analysis.environmentalImpact?.totalCO2Emissions || 0
                        ).toFixed(1)}{" "}
                        kg
                      </p>
                      <p className="text-xs text-green-600">CO2 equivalent</p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          Potential Savings
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-blue-800">
                        {(
                          analysis.environmentalImpact?.potentialCO2Savings || 0
                        ).toFixed(1)}{" "}
                        kg
                      </p>
                      <p className="text-xs text-blue-600">
                        CO2 reduction possible
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">
                          Footprint Reduction
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-purple-800">
                        {(
                          analysis.environmentalImpact
                            ?.carbonFootprintReduction || 0
                        ).toFixed(1)}
                        %
                      </p>
                      <p className="text-xs text-purple-600">
                        potential reduction
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700">
                          Sustainability Score
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-800">
                        {analysis.environmentalImpact?.sustainabilityScore || 0}
                        /100
                      </p>
                      <p className="text-xs text-yellow-600">current rating</p>
                    </div>
                  </div>

                  {/* Emissions Breakdown */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Emissions by Category
                      </h4>
                      <div className="space-y-3">
                        {(
                          analysis.environmentalImpact?.emissionsByCategory ||
                          []
                        ).map((category, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-800">
                                {category.category || "Unknown"}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-500 h-2 rounded-full"
                                    style={{
                                      width: `${category.percentage || 0}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 min-w-[50px]">
                                  {(category.percentage || 0).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-gray-800">
                                {(category.emissions || 0).toFixed(1)} kg
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Environmental Recommendations */}
                    <div>
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Sustainability Actions
                      </h4>
                      <div className="space-y-3">
                        {(
                          analysis.environmentalImpact?.recommendations || []
                        ).map((rec, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 mb-2">
                                  {rec.action || "No action specified"}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                      (rec.feasibility || "low") === "high"
                                        ? "bg-green-100 text-green-800"
                                        : (rec.feasibility || "low") ===
                                            "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {rec.feasibility || "low"} feasibility
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-green-50 p-2 rounded">
                                <span className="text-green-600 font-medium">
                                  CO2 Reduction:
                                </span>
                                <p className="font-bold text-green-800">
                                  {(rec.co2Reduction || 0).toFixed(1)} kg
                                </p>
                              </div>
                              <div className="bg-blue-50 p-2 rounded">
                                <span className="text-blue-600 font-medium">
                                  Cost Savings:
                                </span>
                                <p className="font-bold text-blue-800">
                                  ${(rec.costSavings || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overall Risk Level */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-6 w-6 ${getRiskColor(analysis.riskAssessment?.overall || "low")}`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Overall Risk Level:
                      </p>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          (analysis.riskAssessment?.overall || "low") === "low"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : (analysis.riskAssessment?.overall || "low") ===
                                "medium"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {(
                          analysis.riskAssessment?.overall || "low"
                        ).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Risk Factors */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Risk Factors
                    </h4>
                    <div className="space-y-3">
                      {(analysis.riskAssessment?.factors || []).map(
                        (factor, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                    {factor.category || "General"}
                                  </span>
                                  <div
                                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                      (factor.severity || "low") === "low"
                                        ? "bg-green-100 text-green-800"
                                        : (factor.severity || "low") ===
                                            "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {(factor.severity || "low").toUpperCase()}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed mb-2">
                                  {factor.description ||
                                    "No description available"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Likelihood:
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      (factor.likelihood || 0) >= 0.8
                                        ? "bg-red-500"
                                        : (factor.likelihood || 0) >= 0.5
                                          ? "bg-yellow-500"
                                          : "bg-green-500"
                                    }`}
                                    style={{
                                      width: `${(factor.likelihood || 0) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-700">
                                  {((factor.likelihood || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Mitigation Strategies */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Mitigation Strategies
                    </h4>
                    <div className="space-y-3">
                      {(
                        analysis.riskAssessment?.mitigationStrategies || []
                      ).map((strategy, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-white text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {strategy}
                          </p>
                        </div>
                      ))}
                    </div>
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
