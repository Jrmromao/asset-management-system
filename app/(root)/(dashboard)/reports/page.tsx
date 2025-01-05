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
} from "lucide-react";
import {
  Bar,
  BarChart,
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

// Enhanced sample data with trends
const energyData = [
  { month: "Jan", usage: 320, target: 300, previous: 340 },
  { month: "Feb", usage: 300, target: 300, previous: 320 },
  { month: "Mar", usage: 340, target: 300, previous: 310 },
  { month: "Apr", usage: 280, target: 300, previous: 330 },
  { month: "May", usage: 290, target: 300, previous: 300 },
  { month: "Jun", usage: 310, target: 300, previous: 290 },
];

const assetDistribution = [
  { name: "Laptops", value: 45, trend: "up", change: "+5%" },
  { name: "Monitors", value: 30, trend: "down", change: "-2%" },
  { name: "Mobile Devices", value: 15, trend: "up", change: "+3%" },
  { name: "Others", value: 10, trend: "stable", change: "0%" },
];

const carbonData = [
  { month: "Jan", emissions: 25, target: 22 },
  { month: "Feb", emissions: 23, target: 22 },
  { month: "Mar", emissions: 26, target: 22 },
  { month: "Apr", emissions: 22, target: 22 },
  { month: "May", emissions: 21, target: 22 },
  { month: "Jun", emissions: 20, target: 22 },
];

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#6B7280"];

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("last6Months");
  const [reportType, setReportType] = useState("all");
  const [activeTab, setActiveTab] = useState("charts");

  return (
    <div className="p-8 h-full">
      {/* Enhanced Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-500">
                View and analyze your asset and environmental data
              </p>
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-600"
              >
                15% below target
              </Badge>
            </div>
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
            <ReportBuilder />
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Reports",
              value: "128",
              change: "+12%",
              trend: "up",
              icon: Folder,
            },
            {
              label: "Energy Efficiency",
              value: "92%",
              change: "+5%",
              trend: "up",
              icon: LineChart,
            },
            {
              label: "Carbon Reduction",
              value: "15.2t",
              change: "-8%",
              trend: "down",
              icon: BarChart3,
            },
            {
              label: "Active Assets",
              value: "1,284",
              change: "+3%",
              trend: "up",
              icon: PieChart,
            },
          ].map((stat, index) => (
            <Card key={index} className="bg-white/50 backdrop-blur-sm">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{stat.label}</span>
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

      {/* Enhanced Filters with Tabs */}
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

      {/* Enhanced Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enhanced Energy Usage Chart */}
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
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
          </CardContent>
        </Card>

        {/* Enhanced Carbon Emissions Chart */}
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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={carbonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Asset Distribution Chart */}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={assetDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {assetDistribution.map((item, index) => (
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
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.value}%</span>
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
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Recent Reports */}
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
            <div className="space-y-4">
              {[
                {
                  name: "Monthly Energy Report",
                  date: "2024-01-05",
                  type: "PDF",
                  status: "completed",
                  size: "2.4 MB",
                  icon: FileText,
                },
                {
                  name: "Asset Inventory",
                  date: "2024-01-03",
                  type: "XLSX",
                  status: "completed",
                  size: "1.8 MB",
                  icon: FileText,
                },
                {
                  name: "Carbon Footprint Analysis",
                  date: "2024-01-01",
                  type: "PDF",
                  status: "processing",
                  size: "3.2 MB",
                  icon: FileText,
                },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                      <report.icon className="h-5 w-5 text-gray-500" />
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
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
