import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  MoreHorizontal,
  Play,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Loader2,
  Settings2,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useReportConfigurations,
  useGenerateReport,
  ReportConfiguration,
} from "@/hooks/queries/useReportConfigurations";
import { getAllAssets } from "@/lib/actions/assets.actions";

interface ReportTemplatesProps {
  className?: string;
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({ className }) => {
  const [companyId, setCompanyId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const generateReport = useGenerateReport();

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

  const {
    data: configurationsData,
    isLoading,
    error,
    refetch,
  } = useReportConfigurations(companyId);

  const configurations: ReportConfiguration[] = configurationsData?.data || [];

  const handleGenerateReport = async (configurationId: string, templateName: string) => {
    try {
      const result = await generateReport.mutateAsync({
        configurationId,
        generateNow: true,
      });

      toast({
        title: "Report Generation Started",
        description: `"${templateName}" is being generated. ${result.data.estimatedCompletion}`,
      });

      setTimeout(() => {
        toast({
          title: "Report Generated Successfully",
          description: `"${templateName}" has been generated and is available in Recent Reports.`,
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/api/reports/configurations/${templateToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      toast({
        title: "Success",
        description: "Report template deleted successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "excel":
        return <Settings2 className="h-4 w-4" />;
      case "csv":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-700";
      case "excel":
        return "bg-green-100 text-green-700";
      case "csv":
        return "bg-blue-100 text-blue-700";
      case "dashboard":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings2 className="h-5 w-5 mr-2" />
            Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings2 className="h-5 w-5 mr-2" />
            Report Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Failed to load templates. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings2 className="h-5 w-5 mr-2" />
              Report Templates
            </CardTitle>
            <Badge variant="secondary">{configurations.length} templates</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {configurations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Report Templates</p>
              <p className="text-sm">
                Create your first custom report template to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {configurations.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getFormatIcon(config.format)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {config.name}
                        </h3>
                        <Badge
                          className={`text-xs ${getFormatColor(config.format)}`}
                          variant="secondary"
                        >
                          {config.format.toUpperCase()}
                        </Badge>
                        {config.isScheduled && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {config.scheduleFrequency}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {config.metrics?.length || 0} metrics
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {config.timePeriod}
                        </span>
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {config._count?.generatedReports || 0} reports generated
                        </span>
                        {config.createdAt && (
                          <span>Created {formatDate(config.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleGenerateReport(config.id!, config.name)}
                      disabled={generateReport.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {generateReport.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setTemplateToDelete(config.id!);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report template? This action
              cannot be undone. All generated reports from this template will remain
              available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ReportTemplates; 