import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Plus, Settings2, Table } from "lucide-react";

const ReportBuilder = () => {
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [reportFormat, setReportFormat] = useState("pdf");
  const [dateRange, setDateRange] = useState("last30days");

  const availableMetrics = [
    { id: "energy", label: "Energy Consumption", category: "Environmental" },
    { id: "carbon", label: "Carbon Emissions", category: "Environmental" },
    { id: "assets", label: "Asset Distribution", category: "Assets" },
    { id: "maintenance", label: "Maintenance History", category: "Operations" },
    { id: "costs", label: "Cost Analysis", category: "Financial" },
    { id: "utilization", label: "Device Utilization", category: "Operations" },
    { id: "efficiency", label: "Energy Efficiency", category: "Environmental" },
    {
      id: "compliance",
      label: "Compliance Status",
      category: "Administration",
    },
  ];

  const categories = [...new Set(availableMetrics.map((m) => m.category))];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Custom Report</DialogTitle>
          <DialogDescription>
            Select metrics and customize your report format
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Report Settings */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Basic Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Name</label>
                  <Input placeholder="Enter report name" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV Export</SelectItem>
                      <SelectItem value="dashboard">
                        Interactive Dashboard
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="last3months">Last 3 Months</SelectItem>
                      <SelectItem value="last6months">Last 6 Months</SelectItem>
                      <SelectItem value="lastyear">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Schedule (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="schedule" />
                  <label htmlFor="schedule" className="text-sm">
                    Schedule recurring report
                  </label>
                </div>
                <Select disabled={true}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Metrics Selection */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Select Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-500">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {availableMetrics
                          .filter((metric) => metric.category === category)
                          .map((metric) => (
                            <div
                              key={metric.id}
                              className="flex items-center space-x-2"
                            >
                              {/*<Checkbox*/}
                              {/*  id={metric.id}*/}
                              {/*  checked={selectedMetrics.includes(metric.id)}*/}
                              {/*  onCheckedChange={(checked) => {*/}
                              {/*    if (checked) {*/}
                              {/*      setSelectedMetrics([*/}
                              {/*        ...selectedMetrics,*/}
                              {/*        metric.id,*/}
                              {/*      ]);*/}
                              {/*    } else {*/}
                              {/*      setSelectedMetrics(*/}
                              {/*        selectedMetrics.filter(*/}
                              {/*          (id) => id !== metric.id,*/}
                              {/*        ),*/}
                              {/*      );*/}
                              {/*    }*/}
                              {/*  }}*/}
                              {/*/>*/}
                              <label htmlFor={metric.id} className="text-sm">
                                {metric.label}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Report Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>Report Format: {reportFormat.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Time Period: {dateRange}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Table className="h-4 w-4" />
                      <span>Selected Metrics: {selectedMetrics.length}</span>
                    </div>
                    <div className="space-y-1">
                      {selectedMetrics.map((metricId) => (
                        <div key={metricId} className="text-xs text-gray-500">
                          •{" "}
                          {
                            availableMetrics.find((m) => m.id === metricId)
                              ?.label
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" type="button">
            <Settings2 className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            Generate Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportBuilder;
