"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Download,
  FileText,
  Filter,
  Globe,
  Laptop,
  Monitor,
  Package,
  Search,
  Settings2,
  Smartphone,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState("monthly");
  const [filterStatus, setFilterStatus] = useState("all");

  const growthData = [
    {
      month: "Jan",
      companies: 100,
      users: 1200,
      assets: 3400,
      revenue: 280000,
    },
    {
      month: "Feb",
      companies: 120,
      users: 1400,
      assets: 3800,
      revenue: 320000,
    },
    {
      month: "Mar",
      companies: 135,
      users: 1600,
      assets: 4200,
      revenue: 380000,
    },
    {
      month: "Apr",
      companies: 150,
      users: 1800,
      assets: 4600,
      revenue: 420000,
    },
    {
      month: "May",
      companies: 165,
      users: 2000,
      assets: 5000,
      revenue: 480000,
    },
    {
      month: "Jun",
      companies: 180,
      users: 2200,
      assets: 5400,
      revenue: 520000,
    },
  ];

  const pieData = [
    { name: "Enterprise", value: 45 },
    { name: "Mid-Market", value: 30 },
    { name: "SMB", value: 25 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  const companyStats = [
    {
      title: "Total Companies",
      value: "180",
      change: "+12.5%",
      trend: "up",
      icon: Building2,
      description: "Active companies in the system",
      secondaryMetric: "15 pending approval",
    },
    {
      title: "Total Users",
      value: "2,200",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      description: "Users across all companies",
      secondaryMetric: "92% active last month",
    },
    {
      title: "Total Assets",
      value: "5,400",
      change: "+8.2%",
      trend: "up",
      icon: Package,
      description: "Managed assets platform-wide",
      secondaryMetric: "98% utilized",
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "+0.2%",
      trend: "up",
      icon: Activity,
      description: "Overall system performance",
      secondaryMetric: "No critical issues",
    },
  ];

  const assetCategories = [
    {
      title: "Enterprise Laptops",
      devices: "1,850",
      usage: 92,
      status: "Optimal",
      statusColor: "bg-green-500",
      icon: Laptop,
      trend: "+5.2%",
      alerts: 0,
      maintenance: "Up to date",
    },
    {
      title: "Display Systems",
      devices: "1,280",
      usage: 88,
      status: "Warning",
      statusColor: "bg-yellow-500",
      icon: Monitor,
      trend: "+3.8%",
      alerts: 2,
      maintenance: "5 due soon",
    },
    {
      title: "Mobile Fleet",
      devices: "950",
      usage: 78,
      status: "Attention",
      statusColor: "bg-orange-500",
      icon: Smartphone,
      trend: "+4.5%",
      alerts: 3,
      maintenance: "8 overdue",
    },
  ];

  const recentCompanies = [
    {
      name: "TechCorp Inc.",
      users: 245,
      assets: 580,
      status: "Active",
      region: "North America",
      subscription: "Enterprise",
      lastAudit: "2024-01-15",
      compliance: "Compliant",
    },
    // ... more companies
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Enterprise Dashboard
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-500">
                  Last updated: Today at 09:45 AM
                </p>
                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                  <Globe className="w-3 h-3 mr-1" />
                  All Regions
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Select defaultValue="monthly">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9 transition-transform hover:scale-105">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {companyStats.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 ml-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 ml-1" />
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-gray-100">
                    {stat.secondaryMetric}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Performance Analytics */}
          <Card className="col-span-12 lg:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Platform-wide metrics over time
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Select defaultValue="growth">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select Metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="growth">Growth Metrics</SelectItem>
                    <SelectItem value="usage">Usage Metrics</SelectItem>
                    <SelectItem value="revenue">Revenue Metrics</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient
                        id="colorCompanies"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#6366f1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#6366f1"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#22c55e"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#eab308"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#eab308"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-gray-200"
                    />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="companies"
                      name="Companies"
                      stroke="#6366f1"
                      fill="url(#colorCompanies)"
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stroke="#22c55e"
                      fill="url(#colorUsers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue ($K)"
                      stroke="#eab308"
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Company Distribution */}
          <Card className="col-span-12 lg:col-span-4">
            <CardHeader>
              <CardTitle>Company Distribution</CardTitle>
              <CardDescription>By market segment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#6366f1", // Indigo
                              "#22c55e", // Green
                              "#eab308", // Yellow
                            ][index % 3]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Categories */}
          <Card className="col-span-12 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Asset Categories</CardTitle>
                <CardDescription>Current status by device type</CardDescription>
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {assetCategories.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <category.icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{category.title}</div>
                          <div className="text-sm text-gray-500">
                            {category.devices} devices
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${category.statusColor} text-white`}
                        variant="secondary"
                      >
                        {category.status}
                      </Badge>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Usage</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {category.usage}%
                          </span>
                          <span className="text-xs text-green-600">
                            {category.trend}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${category.statusColor} transition-all duration-500 ease-in-out`}
                          style={{ width: `${category.usage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          {category.maintenance}
                        </span>
                        {category.alerts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {category.alerts} alerts
                          </Badge>
                        )}
                      </div>
                    </div>
                    {index < assetCategories.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Companies */}
          <Card className="col-span-12 lg:col-span-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Recent Companies</CardTitle>
                <CardDescription>
                  Latest company activities and status
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    className="w-64 pl-9"
                    placeholder="Search companies..."
                  />
                </div>
                <Button variant="outline" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Last Audit
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentCompanies.map((company, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 bg-gray-100">
                              <AvatarFallback className="font-medium text-gray-600">
                                {company.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-gray-900">
                                {company.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {company.region}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {company.users}
                          </div>
                          <div className="text-xs text-gray-500">
                            Active users
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {company.assets}
                          </div>
                          <div className="text-xs text-gray-500">
                            Managed assets
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="text-gray-600 bg-gray-50"
                          >
                            {company.region}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`
                            ${
                              company.subscription === "Enterprise"
                                ? "text-purple-600 bg-purple-50"
                                : company.subscription === "Mid-Market"
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-green-600 bg-green-50"
                            }
                          `}
                          >
                            {company.subscription}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {company.lastAudit}
                          </div>
                          <div className="text-xs text-gray-500">
                            {company.compliance}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`${
                              company.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : company.status === "Warning"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {company.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
