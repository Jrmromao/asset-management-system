"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Wrench, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  Lightbulb,
  Zap
} from "lucide-react";
import { AIInsightsDashboard } from "@/components/ai/AIInsightsDashboard";
import { CostOptimizationDashboard } from "@/components/ai/CostOptimizationDashboard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function AIAssistantPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const aiCapabilities = [
    {
      title: "Cost Optimization",
      description: "AI-powered analysis to reduce operational costs",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      value: "Up to 30% savings",
      tab: "cost-optimization"
    },
    {
      title: "Predictive Maintenance", 
      description: "Predict asset failures before they happen",
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      value: "85% accuracy",
      tab: "maintenance"
    },
    {
      title: "Asset Insights",
      description: "Deep analytics on asset performance and utilization",
      icon: BarChart3,
      color: "text-purple-600", 
      bgColor: "bg-purple-50",
      value: "Real-time analysis",
      tab: "insights"
    },
    {
      title: "Anomaly Detection",
      description: "Identify unusual patterns and potential issues",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      value: "24/7 monitoring",
      tab: "anomalies"
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>AI Assistant</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Leverage artificial intelligence to optimize your asset management operations
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          AI Powered
        </Badge>
      </div>

      {/* AI Capabilities Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {aiCapabilities.map((capability) => {
          const Icon = capability.icon;
          return (
            <Card 
              key={capability.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab(capability.tab)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {capability.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${capability.bgColor}`}>
                  <Icon className={`h-4 w-4 ${capability.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {capability.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {capability.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Functionality Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cost-optimization">Cost Optimization</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="insights">Asset Insights</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                AI Assistant Overview
              </CardTitle>
              <CardDescription>
                Your AI assistant provides intelligent insights and recommendations to optimize your asset management operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What AI Can Do For You</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full" />
                      Analyze cost optimization opportunities across licenses and accessories
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      Predict maintenance needs before assets fail
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full" />
                      Provide deep insights into asset utilization and performance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-orange-500 rounded-full" />
                      Detect anomalies and unusual patterns in your data
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Getting Started</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setActiveTab("cost-optimization")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Run Cost Analysis
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("insights")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Asset Insights
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("maintenance")}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Predictive Maintenance
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cost-optimization">
          <CostOptimizationDashboard />
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Predictive Maintenance
              </CardTitle>
              <CardDescription>
                AI-powered maintenance recommendations based on asset condition and usage patterns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Predictive Maintenance Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  AI-powered maintenance predictions will help you prevent asset failures before they happen.
                </p>
                <Button disabled>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Maintenance Predictions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <AIInsightsDashboard />
        </TabsContent>

        <TabsContent value="anomalies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Anomaly Detection
              </CardTitle>
              <CardDescription>
                Identify unusual patterns and potential issues in your asset data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Anomaly Detection Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  AI will continuously monitor your assets for unusual patterns and alert you to potential issues.
                </p>
                <Button disabled>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Anomaly Detection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
