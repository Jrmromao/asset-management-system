import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Form } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  FileText, 
  Plus, 
  Settings2, 
  Table, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CustomInput from "@/components/CustomInput";
import CustomSelect from "@/components/CustomSelect";
import CustomSwitch from "@/components/CustomSwitch";
import { 
  useCreateReportConfiguration, 
  useGenerateReport,
  ReportMetric,
  ReportConfiguration
} from "@/hooks/queries/useReportConfigurations";
import { getAllAssets } from "@/lib/actions/assets.actions";

// Report Builder Schema
const reportBuilderSchema = z.object({
  reportName: z
    .string()
    .min(3, "Report name must be at least 3 characters long")
    .max(100, "Report name must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_()]+$/, "Report name can only contain letters, numbers, spaces, hyphens, underscores, and parentheses"),
  selectedMetrics: z
    .array(z.string())
    .min(1, "Please select at least one metric")
    .max(8, "Please select no more than 8 metrics for optimal performance"),
  reportFormat: z.enum(["pdf", "excel", "csv", "dashboard"]),
  dateRange: z.enum(["last30days", "last3months", "last6months", "lastyear", "custom"]),
  isScheduled: z.boolean(),
  scheduleFrequency: z.string().optional(),
}).refine(
  (data) => !data.isScheduled || (data.isScheduled && data.scheduleFrequency),
  {
    message: "Please select a schedule frequency",
    path: ["scheduleFrequency"],
  }
);

type ReportBuilderFormValues = z.infer<typeof reportBuilderSchema>;

const ReportBuilder = () => {
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");
  const [step, setStep] = useState<"configure" | "preview" | "generating">("configure");

  const { toast } = useToast();
  const createConfiguration = useCreateReportConfiguration();
  const generateReport = useGenerateReport();

  // React Hook Form setup
  const form = useForm<ReportBuilderFormValues>({
    resolver: zodResolver(reportBuilderSchema),
    defaultValues: {
      reportName: "",
      selectedMetrics: [],
      reportFormat: "pdf",
      dateRange: "last30days",
      isScheduled: false,
      scheduleFrequency: "",
    },
    mode: "onChange",
  });

  // Initialize company ID
  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const assetsRes = await getAllAssets();
        if (assetsRes.success && assetsRes.data && assetsRes.data.length > 0) {
          setCompanyId(assetsRes.data[0].companyId);
        }
      } catch (error) {
        console.error("Failed to fetch company ID:", error);
      }
    };
    fetchCompanyId();
  }, []);

  const availableMetrics: { id: string; label: string; category: string; description: string }[] = [
    { 
      id: "energy", 
      label: "Energy Consumption", 
      category: "Environmental",
      description: "Track energy usage across all assets and accessories"
    },
    { 
      id: "carbon", 
      label: "Carbon Emissions", 
      category: "Environmental",
      description: "Monitor CO₂ emissions and reduction targets"
    },
    { 
      id: "assets", 
      label: "Asset Distribution", 
      category: "Assets",
      description: "Analyze asset distribution by category and location"
    },
    { 
      id: "maintenance", 
      label: "Maintenance History", 
      category: "Operations",
      description: "Review maintenance activities and schedules"
    },
    { 
      id: "costs", 
      label: "Cost Analysis", 
      category: "Financial",
      description: "Examine total cost of ownership and depreciation"
    },
    { 
      id: "utilization", 
      label: "Device Utilization", 
      category: "Operations",
      description: "Monitor asset usage and efficiency metrics"
    },
    { 
      id: "efficiency", 
      label: "Energy Efficiency", 
      category: "Environmental",
      description: "Analyze energy efficiency trends and targets"
    },
    {
      id: "compliance",
      label: "Compliance Status",
      category: "Administration",
      description: "Track license compliance and warranty status"
    },
    {
      id: "lifecycle",
      label: "Asset Lifecycle",
      category: "Assets",
      description: "Monitor asset lifecycle stages and planning"
    },
    {
      id: "security",
      label: "Security Metrics",
      category: "Administration", 
      description: "Track security compliance and incidents"
    },
  ];

  const categories = Array.from(new Set(availableMetrics.map((m) => m.category)));

  // Form handlers using React Hook Form
  const handleMetricToggle = (metricId: string) => {
    const currentMetrics = form.getValues("selectedMetrics");
    const newMetrics = currentMetrics.includes(metricId) 
      ? currentMetrics.filter((id: string) => id !== metricId)
      : [...currentMetrics, metricId];
    
    form.setValue("selectedMetrics", newMetrics, { shouldValidate: true });
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryMetrics = availableMetrics
      .filter(m => m.category === category)
      .map(m => m.id);
    
    const currentMetrics = form.getValues("selectedMetrics");
    const allSelected = categoryMetrics.every((id: string) => currentMetrics.includes(id));
    
    let newMetrics: string[];
    if (allSelected) {
      newMetrics = currentMetrics.filter((id: string) => !categoryMetrics.includes(id));
    } else {
      newMetrics = Array.from(new Set([...currentMetrics, ...categoryMetrics]));
    }
    
    form.setValue("selectedMetrics", newMetrics, { shouldValidate: true });
  };

  const validateForm = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      const errors = form.formState.errors;
      const firstError = errors.reportName?.message || 
                        errors.selectedMetrics?.message || 
                        errors.scheduleFrequency?.message;
      
      toast({
        title: "Validation Error",
        description: firstError || "Please correct the errors in the form",
        variant: "destructive",
      });
    }
    return isValid;
  };

  const handleSaveTemplate = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    const formData = form.getValues();
    const metrics: ReportMetric[] = formData.selectedMetrics.map((metricId: string) => {
      const metric = availableMetrics.find(m => m.id === metricId);
      return {
        category: metric?.category || "",
        metricName: metric?.label || "",
        enabled: true,
      };
    });

    const configuration: ReportConfiguration = {
      name: formData.reportName,
      format: formData.reportFormat,
      timePeriod: formData.dateRange,
      isScheduled: formData.isScheduled,
      scheduleFrequency: formData.isScheduled ? formData.scheduleFrequency : undefined,
      companyId,
      metrics,
    };

    try {
      await createConfiguration.mutateAsync(configuration);
      toast({
        title: "Success",
        description: "Report template saved successfully",
      });
      resetForm();
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setStep("generating");

    // First save the configuration
    const formData = form.getValues();
    const metrics: ReportMetric[] = formData.selectedMetrics.map((metricId: string) => {
      const metric = availableMetrics.find(m => m.id === metricId);
      return {
        category: metric?.category || "",
        metricName: metric?.label || "",
        enabled: true,
      };
    });

    const configuration: ReportConfiguration = {
      name: formData.reportName,
      format: formData.reportFormat,
      timePeriod: formData.dateRange,
      isScheduled: formData.isScheduled,
      scheduleFrequency: formData.isScheduled ? formData.scheduleFrequency : undefined,
      companyId,
      metrics,
    };

    try {
      const configResult = await createConfiguration.mutateAsync(configuration);
      
      // Then generate the report
      const generateResult = await generateReport.mutateAsync({
        configurationId: configResult.data.id,
        generateNow: true,
      });

      toast({
        title: "Report Generation Started",
        description: `Your report is being generated. Estimated completion: ${generateResult.data.estimatedCompletion}`,
      });

      setTimeout(() => {
        toast({
          title: "Report Generated Successfully",
          description: "Your custom report has been generated and is available in the Recent Reports section.",
        });
        resetForm();
        setOpen(false);
      }, 3000);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
      setStep("configure");
    }
  };

  const resetForm = () => {
    form.reset();
    setStep("configure");
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const getSelectedMetricsDetails = () => {
    const selectedMetrics = form.watch("selectedMetrics");
    return selectedMetrics.map((metricId: string) => 
      availableMetrics.find(m => m.id === metricId)
    ).filter(Boolean);
  };

  // Format options for the select
  const formatOptions = [
    { id: "pdf", name: "PDF Report" },
    { id: "excel", name: "Excel Spreadsheet" },
    { id: "csv", name: "CSV Export" },
    { id: "dashboard", name: "Interactive Dashboard" },
  ];

  const dateRangeOptions = [
    { id: "last30days", name: "Last 30 Days" },
    { id: "last3months", name: "Last 3 Months" },
    { id: "last6months", name: "Last 6 Months" },
    { id: "lastyear", name: "Last Year" },
    { id: "custom", name: "Custom Range" },
  ];

  const scheduleOptions = [
    { id: "daily", name: "Daily" },
    { id: "weekly", name: "Weekly" },
    { id: "monthly", name: "Monthly" },
    { id: "quarterly", name: "Quarterly" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">Create Custom Report</DialogTitle>
          <DialogDescription>
            Design your personalized report with custom metrics and formatting
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === "generating" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <h3 className="text-lg font-medium">Generating Your Report</h3>
              <p className="text-gray-500 text-center max-w-md">
                We're processing your selected metrics and generating your custom report. 
                This usually takes 2-3 minutes.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>Estimated completion: 2-3 minutes</span>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <div className="grid grid-cols-3 gap-6 p-1">
                {/* Left Column - Report Settings */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Basic Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CustomInput
                        name="reportName"
                        label="Report Name"
                        control={form.control}
                        placeholder="Enter report name (e.g., Monthly Asset Report)"
                        required
                      />

                      <CustomSelect
                        name="reportFormat"
                        label="Format"
                        control={form.control}
                        data={formatOptions}
                        placeholder="Select format"
                      />

                      <CustomSelect
                        name="dateRange"
                        label="Time Period"
                        control={form.control}
                        data={dateRangeOptions}
                        placeholder="Select time period"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule (Optional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CustomSwitch
                        name="isScheduled"
                        label="Schedule recurring report"
                        control={form.control}
                      />
                      
                      {form.watch("isScheduled") && (
                        <CustomSelect
                          name="scheduleFrequency"
                          label="Frequency"
                          control={form.control}
                          data={scheduleOptions}
                          placeholder="Select frequency"
                          required
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Middle Column - Metrics Selection */}
                <div className="space-y-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center justify-between">
                        <div className="flex items-center">
                          <Table className="h-4 w-4 mr-2" />
                          Select Metrics *
                        </div>
                        <Badge variant="secondary">
                          {form.watch("selectedMetrics").length} selected
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {categories.map((category) => {
                          const categoryMetrics = availableMetrics.filter(
                            (metric) => metric.category === category
                          );
                          const selectedMetrics = form.watch("selectedMetrics");
                          const selectedInCategory = categoryMetrics.filter(m => 
                            selectedMetrics.includes(m.id)
                          ).length;
                          
                          return (
                            <div key={category} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-700">
                                  {category}
                                </h3>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {selectedInCategory}/{categoryMetrics.length}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs h-6 px-2"
                                    onClick={() => handleSelectAllInCategory(category)}
                                    type="button"
                                  >
                                    {selectedInCategory === categoryMetrics.length ? "Deselect All" : "Select All"}
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {categoryMetrics.map((metric) => (
                                  <div
                                    key={metric.id}
                                    className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                  >
                                    <Checkbox
                                      id={metric.id}
                                      checked={selectedMetrics.includes(metric.id)}
                                      onCheckedChange={() => handleMetricToggle(metric.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <Label 
                                        htmlFor={metric.id} 
                                        className="text-sm font-medium cursor-pointer"
                                      >
                                        {metric.label}
                                      </Label>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {metric.description}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {category !== categories[categories.length - 1] && (
                                <Separator className="mt-4" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {form.formState.errors.selectedMetrics && (
                        <div className="flex items-center space-x-1 text-sm text-red-600 mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>{form.formState.errors.selectedMetrics.message}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Preview */}
                <div className="space-y-4">
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Report Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Report Details</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium">Name:</span> {form.watch("reportName") || "Untitled Report"}</div>
                            <div><span className="font-medium">Format:</span> {form.watch("reportFormat").toUpperCase()}</div>
                            <div><span className="font-medium">Period:</span> {form.watch("dateRange")}</div>
                            {form.watch("isScheduled") && (
                              <div><span className="font-medium">Schedule:</span> {form.watch("scheduleFrequency")}</div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <Table className="h-4 w-4" />
                            <span className="font-medium">Selected Metrics ({form.watch("selectedMetrics").length})</span>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {getSelectedMetricsDetails().map((metric) => (
                              <div key={metric?.id} className="flex items-center justify-between text-xs">
                                <div>
                                  <div className="font-medium">{metric?.label}</div>
                                  <div className="text-gray-500">{metric?.category}</div>
                                </div>
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              </div>
                            ))}
                            {form.watch("selectedMetrics").length === 0 && (
                              <div className="text-xs text-gray-500 italic">
                                No metrics selected
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-2">
                            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div className="text-xs text-blue-700">
                              <p className="font-medium mb-1">Report Generation</p>
                              <p>Your report will be generated with real data from your asset management system. Processing typically takes 2-3 minutes.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Form>
          )}
        </div>

        {step !== "generating" && (
          <DialogFooter className="shrink-0 mt-4 pt-4 border-t flex-row justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handleSaveTemplate}
              disabled={createConfiguration.isPending}
              className="flex items-center"
              type="button"
            >
              {createConfiguration.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings2 className="h-4 w-4 mr-2" />
              )}
              Save as Template
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleClose} type="button">
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateReport}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={generateReport.isPending || createConfiguration.isPending}
                type="button"
              >
                {generateReport.isPending || createConfiguration.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportBuilder;
