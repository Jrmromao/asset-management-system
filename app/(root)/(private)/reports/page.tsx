"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Download,
  FileText,
  Filter,
  Folder,
  LineChart,
  PieChart,
  Search,
  Share2,
  BarChart,
  DollarSign,
  Activity,
  Shield,
  Info,
  Zap,
  Leaf,
  Settings2,
} from "lucide-react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportBuilder from "@/components/reports/ReportBuilder";
import ReportTemplates from "@/components/reports/ReportTemplates";
import { ReportCategoryCard } from "@/components/reports/ReportCategoryCard";
import { useReportData } from "@/hooks/queries/useReportData";
import {
  Tooltip as UiTooltip,
  TooltipContent as UiTooltipContent,
  TooltipProvider as UiTooltipProvider,
  TooltipTrigger as UiTooltipTrigger,
} from "@/components/ui/tooltip";
import AllReportsModal from "@/components/reports/AllReportsModal";
import { useAllReports } from "@/hooks/queries/useAllReports";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#6B7280"];

const CATEGORY_CONFIG = [
  {
    key: "all",
    icon: <Folder className="h-8 w-8 text-gray-600" />,
    title: "All Reports",
    description: "Overview of all reporting categories.",
  },
  {
    key: "esg",
    icon: <BarChart className="h-8 w-8 text-emerald-600" />,
    title: "ESG & Environmental",
    description: "CO₂ emissions, energy, lifecycle sustainability.",
  },
  {
    key: "financial",
    icon: <DollarSign className="h-8 w-8 text-blue-600" />,
    title: "Financial",
    description: "Depreciation, TCO, asset valuation.",
  },
  {
    key: "operational",
    icon: <Activity className="h-8 w-8 text-amber-600" />,
    title: "Operational",
    description: "Maintenance, utilization, audits.",
  },
  {
    key: "compliance",
    icon: <Shield className="h-8 w-8 text-red-600" />,
    title: "Compliance",
    description: "License compliance, warranty expirations.",
  },
];

const UnifiedReportsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dateRange, setDateRange] = useState("last6Months");
  const [activeTab, setActiveTab] = useState("charts");
  const [showAllReports, setShowAllReports] = useState(false);
  const { toast } = useToast();

  // Fetch report data from API
  const {
    data: reportData,
    isLoading,
    error,
  } = useReportData(selectedCategory, dateRange);
  const apiData = reportData?.data || {};

  // Add this hook for fetching all reports
  const {
    data: allReportsData,
    isLoading: allReportsLoading,
    error: allReportsError,
  } = useAllReports();

  // Filter logic for premium UX (expand as real data is available)
  const showESG = selectedCategory === "all" || selectedCategory === "esg";
  const showFinancial =
    selectedCategory === "all" || selectedCategory === "financial";
  const showOperational =
    selectedCategory === "all" || selectedCategory === "operational";
  const showCompliance =
    selectedCategory === "all" || selectedCategory === "compliance";

  // Loading and error UI
  const renderLoading = () => (
    <div className="flex items-center justify-center h-[300px] w-full">
      <span className="text-gray-400 animate-pulse">Loading...</span>
    </div>
  );
  const renderError = () => (
    <div className="flex items-center justify-center h-[300px] w-full">
      <span className="text-red-500">Failed to load data.</span>
    </div>
  );

  // Stat card data from API
  const statCards = [
    {
      label: "Total Reports",
      value: apiData.totalReports ?? "-",
      change: apiData.totalReportsChange ?? "",
      trend: apiData.totalReportsChange?.includes("-") ? "down" : "up",
      icon: Folder,
    },
    {
      label: "Energy Efficiency",
      value: apiData.energyEfficiency ? `${apiData.energyEfficiency}%` : "-",
      change: apiData.energyEfficiencyChange ?? "",
      trend: apiData.energyEfficiencyChange?.includes("-") ? "down" : "up",
      icon: Zap,
      tooltip: (
        <UiTooltipProvider>
          <UiTooltip>
            <UiTooltipTrigger asChild>
              <Info className="ml-1 h-4 w-4 text-gray-400 cursor-pointer" />
            </UiTooltipTrigger>
            <UiTooltipContent className="max-w-xs">
              <div className="text-xs text-gray-700">
                Energy Efficiency: 100% when at/below target, decreases when
                over target
                <br />
                <span className="font-medium">Target:</span>{" "}
                {apiData.targetEnergy
                  ? `${apiData.targetEnergy} kWh`
                  : "Not set"}
                <br />
                <span className="font-medium">Actual Used:</span>{" "}
                {apiData.totalEnergy ?? 0} kWh
              </div>
            </UiTooltipContent>
          </UiTooltip>
        </UiTooltipProvider>
      ),
    },
    {
      label: "Carbon Reduction",
      value: apiData.carbonReduction ? `${apiData.carbonReduction} t` : "-",
      change: apiData.carbonReductionChange ?? "",
      trend: apiData.carbonReductionChange?.includes("-") ? "down" : "up",
      icon: Leaf,
      tooltip: (
        <UiTooltipProvider>
          <UiTooltip>
            <UiTooltipTrigger asChild>
              <Info className="ml-1 h-4 w-4 text-gray-400 cursor-pointer" />
            </UiTooltipTrigger>
            <UiTooltipContent className="max-w-xs">
              <div className="text-xs text-gray-700">
                Total CO₂ emissions saved through asset management
                <br />
                <span className="font-medium">Target:</span>{" "}
                {apiData.targetCarbonReduction
                  ? `${apiData.targetCarbonReduction} t`
                  : "Not set"}
                <br />
                <span className="font-medium">Actual Saved:</span>{" "}
                {apiData.carbonReduction ?? 0} t
              </div>
            </UiTooltipContent>
          </UiTooltip>
        </UiTooltipProvider>
      ),
    },
    {
      label: "Active Assets",
      value: apiData.activeAssets ?? "-",
      change: apiData.activeAssetsChange ?? "",
      trend: apiData.activeAssetsChange?.includes("-") ? "down" : "up",
      icon: PieChart,
    },
  ];

  // Update the allReports mapping to include filePath
  const allReports = (allReportsData?.data || []).map((r: any, idx: number) => ({
    id: r.id || `report-${idx}`,
    name: r.name || r.title || "Untitled",
    createdAt: r.createdAt || r.date || r.generatedAt || new Date().toISOString(),
    sizeMB: r.sizeMB || r.size || r.fileSize || 0,
    status: r.status || "active",
    scheduledDeletionAt: r.scheduledDeletionAt || null,
    filePath: r.filePath || null,
  }));

  // Updated action handlers with toaster notifications
  const handleArchive = (id: string) => {
    // TODO: Implement actual archive functionality
    console.log(`Archive report ${id}`);
    toast({
      title: "Archive Action",
      description: `Report ${id} archive functionality will be implemented soon.`,
    });
  };

  const handleRestore = (id: string) => {
    // TODO: Implement actual restore functionality
    console.log(`Restore report ${id}`);
    toast({
      title: "Restore Action",
      description: `Report ${id} restore functionality will be implemented soon.`,
    });
  };

  const handleDelete = (id: string) => {
    // TODO: Implement actual delete functionality
    console.log(`Delete report ${id}`);
    toast({
      title: "Delete Action",
      description: `Report ${id} delete functionality will be implemented soon.`,
    });
  };

  const handleScheduleDeletion = (id: string, date: string) => {
    // TODO: Implement actual schedule deletion functionality
    console.log(`Schedule deletion for report ${id} on ${date}`);
    toast({
      title: "Schedule Deletion Action",
      description: `Report ${id} schedule deletion functionality will be implemented soon.`,
    });
  };

  return (
    <div className="p-8 h-full">
      {/* Report Hub Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Report Hub</h1>
            <p className="text-sm text-gray-500 mt-1">
              Generate, analyze, and manage all your asset and environmental
              reports in one place.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch('/api/reports/test', { method: 'POST' });
                  const result = await response.json();
                  if (result.success) {
                    window.location.reload(); // Refresh to show the new test report
                  } else {
                    alert('Error creating test report: ' + result.error);
                  }
                } catch (error) {
                  alert('Failed to create test report');
                }
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Test Report
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch('/api/reports/fix-paths', { method: 'POST' });
                  const result = await response.json();
                  if (result.success) {
                    alert(`Fixed ${result.data.reportsFixed} report paths`);
                    window.location.reload(); // Refresh to show the updated reports
                  } else {
                    alert('Error fixing paths: ' + result.error);
                  }
                } catch (error) {
                  alert('Failed to fix report paths');
                }
              }}
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Fix Paths
            </Button>
            <ReportBuilder />
          </div>
        </div>
        {/* Category Cards as Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {CATEGORY_CONFIG.map((cat) => (
            <div key={cat.key} onClick={() => setSelectedCategory(cat.key)}>
              <ReportCategoryCard
                icon={cat.icon}
                title={cat.title}
                description={cat.description}
                link="#"
              />
              {selectedCategory === cat.key && (
                <div className="h-1 bg-emerald-600 rounded-b" />
              )}
            </div>
          ))}
        </div>
        {/* Quick Stats Row (always visible) */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <Card key={i} className="bg-white/50 backdrop-blur-sm">
                  <CardContent className="pt-4">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-20 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur-sm">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500 flex items-center">
                        {stat.label}
                        {stat.tooltip && stat.tooltip}
                      </span>
                      <stat.icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <div
                        className={`flex items-center text-sm ${
                          stat.trend === "up"
                            ? "text-emerald-600"
                            : stat.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : stat.trend === "down" ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : null}
                        {stat.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
              <TabsTrigger value="reports">Saved Reports</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 w-[300px]"
                  placeholder="Search reports..."
                />
              </div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last6Months">Last 6 Months</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Tab Content */}
      {activeTab === "charts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ESG & Environmental */}
        {showESG && (
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Energy Usage</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Monthly consumption in kWh
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-600"
                    >
                      -8% vs last month
                    </Badge>
                  </CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[300px] w-full">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ) : error ? (
                renderError()
              ) : apiData.energyUsage ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={apiData.energyUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="usage"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={{ fill: "#10B981", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#6B7280"
                        strokeDasharray="5 5"
                        strokeWidth={1}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-12">
                  No data available.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Carbon Emissions (ESG) */}
        {showESG && (
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Carbon Emissions</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    Monthly CO₂ emissions in tons
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-600"
                    >
                      On target
                    </Badge>
                  </CardDescription>
                </div>
                <BarChart3 className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[300px] w-full">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="flex gap-2 w-full items-end justify-center mt-8">
                    {/* Varying bar heights for realism */}
                    <Skeleton className="h-32 w-8 rounded" />
                    <Skeleton className="h-24 w-8 rounded" />
                    <Skeleton className="h-40 w-8 rounded" />
                    <Skeleton className="h-28 w-8 rounded" />
                    <Skeleton className="h-36 w-8 rounded" />
                    <Skeleton className="h-20 w-8 rounded" />
                  </div>
                </div>
              ) : error ? (
                renderError()
              ) : apiData.carbonEmissions ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={apiData.carbonEmissions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip />
                      <Bar
                        dataKey="emissions"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#6B7280"
                        strokeDasharray="5 5"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-12">
                  No data available.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Asset Distribution (Operational) - Placeholder for now */}
        {showOperational && (
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asset Distribution</CardTitle>
                  <CardDescription>By device category</CardDescription>
                </div>
                <PieChart className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Pie chart skeleton */}
                  <div className="flex flex-col items-center justify-center h-[300px]">
                    <Skeleton className="rounded-full w-40 h-40 mb-4" />
                  </div>
                  {/* Legend skeletons */}
                  <div className="space-y-4 mt-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-3 h-3 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-4 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : apiData.assetDistribution ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={apiData.assetDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {apiData.assetDistribution.map(
                            (entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ),
                          )}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {apiData.assetDistribution.map(
                      (item: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">
                              {item.value}%
                            </span>
                            <span
                              className={`text-xs ${
                                item.trend === "up"
                                  ? "text-emerald-600"
                                  : item.trend === "down"
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {item.change}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  Coming soon
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Reports (All) */}
        {selectedCategory === "all" && (
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>Latest generated reports</CardDescription>
                </div>
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {/* Loading skeleton for 3 report items */}
                  {[1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {apiData.recentReports && apiData.recentReports.length > 0 ? (
                    apiData.recentReports.map((report: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                            <FileText className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900">
                              {report.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {report.date}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {report.type}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {report.size}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {report.status === "processing" ? (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-600"
                            >
                              Processing
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-gray-600"
                              onClick={async () => {
                                if (!report.filePath) {
                                  alert('Download not available');
                                  return;
                                }
                                try {
                                  const response = await fetch(report.filePath);
                                  if (response.status === 202) {
                                    alert('Report is still being generated. Please try again in a few moments.');
                                    return;
                                  }
                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
                                    alert(errorData.error || 'Download failed');
                                    return;
                                  }
                                  const contentType = response.headers.get('content-type');
                                  if (contentType && contentType.includes('application/json')) {
                                    const jsonData = await response.json();
                                    console.log('Dashboard data:', jsonData);
                                    alert('Dashboard data logged to console (feature coming soon)');
                                    return;
                                  }
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  const disposition = response.headers.get('content-disposition');
                                  let filename = 'report';
                                  if (disposition && disposition.includes('filename=')) {
                                    filename = disposition.split('filename=')[1].replace(/"/g, '');
                                  }
                                  a.download = filename;
                                  document.body.appendChild(a);
                                  a.click();
                                  window.URL.revokeObjectURL(url);
                                  document.body.removeChild(a);
                                } catch (error) {
                                  console.error('Download error:', error);
                                  alert('Failed to download report');
                                }
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-center py-12">
                      No recent reports available.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <button
                className="mt-2 text-emerald-700 hover:underline text-sm font-medium"
                onClick={() => setShowAllReports(true)}
              >
                📄 View All Reports
              </button>
              <AllReportsModal
                open={showAllReports}
                onOpenChange={() => setShowAllReports(false)}
                reports={allReports}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
                onScheduleDeletion={handleScheduleDeletion}
              />
            </CardFooter>
          </Card>
        )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <ReportTemplates />
        </div>
      )}

      {/* Saved Reports Tab - Placeholder */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>
                All your generated reports organized by date and category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Saved Reports Coming Soon</p>
                <p className="text-sm">
                  This section will display all your generated reports with advanced filtering and search capabilities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnifiedReportsPage;
