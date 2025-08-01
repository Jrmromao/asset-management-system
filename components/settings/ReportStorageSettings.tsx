"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Trash2,
  HardDrive,
  FileText,
  Calendar,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Settings,
  TrendingUp,
  Clock,
  Database,
  Zap,
  Shield,
  Target,
  Hash,
  Activity,
  Brain,
  Sparkles,
  Archive,
  X,
  CheckCircle2,
  ShieldOff,
  Unlock,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getProtectionRules,
  removeProtection,
} from "@/lib/actions/smart-cleanup.actions";

interface StorageStats {
  totalReports: number;
  totalSizeInMB: number;
  reportsByFormat: Record<string, { count: number; sizeInMB: number }>;
  oldestReport: Date | null;
  newestReport: Date | null;
}

interface CleanupStats {
  deletedReports: number;
  deletedFiles: number;
  freedSpace: number;
  errors: string[];
}

interface RetentionPolicy {
  maxAgeInDays: number;
  maxReportsPerConfiguration: number;
  maxTotalSizeInMB: number;
}

const DEFAULT_POLICIES: Record<string, RetentionPolicy> = {
  pdf: {
    maxAgeInDays: 90,
    maxReportsPerConfiguration: 50,
    maxTotalSizeInMB: 500,
  },
  excel: {
    maxAgeInDays: 60,
    maxReportsPerConfiguration: 30,
    maxTotalSizeInMB: 200,
  },
  csv: {
    maxAgeInDays: 30,
    maxReportsPerConfiguration: 20,
    maxTotalSizeInMB: 100,
  },
  dashboard: {
    maxAgeInDays: 7,
    maxReportsPerConfiguration: 10,
    maxTotalSizeInMB: 50,
  },
};

const RETENTION_POLICIES = [
  {
    format: "pdf",
    icon: FileText,
    description: "Official documents and archives",
    retentionDays: 90,
    maxFiles: 50,
    maxSizeMB: 500,
    recommendation:
      "PDFs are ideal for long-term storage. Consider extending retention for compliance requirements.",
  },
  {
    format: "excel",
    icon: BarChart3,
    description: "Data analysis and business reports",
    retentionDays: 60,
    maxFiles: 30,
    maxSizeMB: 200,
    recommendation:
      "Excel files balance accessibility with storage costs. Perfect for monthly business reviews.",
  },
  {
    format: "csv",
    icon: Database,
    description: "Data exports and quick analysis",
    retentionDays: 30,
    maxFiles: 20,
    maxSizeMB: 100,
    recommendation:
      "CSV exports are optimized for frequent access and quick cleanup cycles.",
  },
  {
    format: "dashboard",
    icon: TrendingUp,
    description: "Real-time insights and interactive data",
    retentionDays: 7,
    maxFiles: 10,
    maxSizeMB: 50,
    recommendation:
      "Dashboard reports prioritize recent data with aggressive cleanup for optimal performance.",
  },
];

const ReportStorageSettings = () => {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [policies, setPolicies] =
    useState<Record<string, RetentionPolicy>>(DEFAULT_POLICIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleanupRunning, setIsCleanupRunning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<CleanupStats | null>(null);
  const [expandedPolicies, setExpandedPolicies] = useState<string[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [smartCleanupAnalysis, setSmartCleanupAnalysis] = useState<any>(null);
  const [isSmartAnalyzing, setIsSmartAnalyzing] = useState(false);
  const [isSmartCleanupRunning, setIsSmartCleanupRunning] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [protectedFiles, setProtectedFiles] = useState<any[]>([]);
  const [isLoadingProtectedFiles, setIsLoadingProtectedFiles] = useState(false);
  const [executingRecommendation, setExecutingRecommendation] = useState<
    string | null
  >(null);
  const [completedRecommendations, setCompletedRecommendations] = useState<
    Set<string>
  >(new Set());
  const [isProtectedFilesCollapsed, setIsProtectedFilesCollapsed] =
    useState(true);
  const [isTraditionalCleanupCollapsed, setIsTraditionalCleanupCollapsed] =
    useState(true);

  // Load storage statistics
  const loadStorageStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/reports/cleanup");
      if (response.ok) {
        const data = await response.json();
        setStorageStats(data.stats);
      } else {
        throw new Error("Failed to load storage statistics");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load storage statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load protected files
  const loadProtectedFiles = async () => {
    setIsLoadingProtectedFiles(true);
    try {
      const result = await getProtectionRules();
      if (result.success) {
        setProtectedFiles(result.data || []);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load protected files",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProtectedFiles(false);
    }
  };

  // Remove protection from a file
  const handleRemoveProtection = async (protectionRuleId: string) => {
    try {
      const result = await removeProtection(protectionRuleId);
      if (result.success) {
        toast({
          title: "Protection Removed",
          description: result.message,
        });
        await loadProtectedFiles(); // Reload the list
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove protection",
        variant: "destructive",
      });
    }
  };

  // Run cleanup
  const runCleanup = async () => {
    setIsCleanupRunning(true);
    try {
      const response = await fetch("/api/reports/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cleanup",
          customPolicies: policies,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setLastCleanup(data.stats);

        toast({
          title: "Cleanup Completed",
          description: `Deleted ${data.stats.deletedReports} reports and freed ${data.stats.freedSpace.toFixed(2)} MB`,
        });

        await loadStorageStats();
      } else {
        throw new Error("Cleanup failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run cleanup",
        variant: "destructive",
      });
    } finally {
      setIsCleanupRunning(false);
    }
  };

  // Toggle policy expansion
  const togglePolicyExpansion = (format: string) => {
    setExpandedPolicies((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format],
    );
  };

  // Load data on component mount
  useEffect(() => {
    loadStorageStats();
    loadProtectedFiles();
  }, []);

  // Run Smart Cleanup Analysis
  const runSmartAnalysis = async () => {
    setIsSmartAnalyzing(true);
    try {
      const response = await fetch(
        "/api/reports/smart-cleanup?action=recommendations",
      );
      if (response.ok) {
        const data = await response.json();
        setSmartCleanupAnalysis(data.data);

        toast({
          title: "Smart Analysis Complete",
          description: `Analyzed ${data.data.analyzedFiles} files with ${data.data.recommendations.length} recommendations`,
        });
      } else {
        throw new Error("Smart analysis failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run smart analysis",
        variant: "destructive",
      });
    } finally {
      setIsSmartAnalyzing(false);
    }
  };

  // Execute a single recommendation
  const executeRecommendation = async (recommendation: any) => {
    setExecutingRecommendation(recommendation.filePath);

    try {
      const response = await fetch("/api/reports/smart-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_single",
          recommendation,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Mark as completed
        setCompletedRecommendations(
          (prev: Set<string>) =>
            new Set([...Array.from(prev), recommendation.filePath]),
        );

        // Premium toast for PROTECT action
        if (recommendation.action === "PROTECT") {
          // Create premium toast with custom styling and animations
          toast({
            title: (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  {/* Pulse animation ring */}
                  <div className="absolute inset-0 w-10 h-10 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                  {/* Success checkmark overlay */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 flex items-center gap-2">
                    🛡️ File Protected Successfully
                    <div className="flex items-center">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div
                        className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse ml-1"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse ml-1"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-normal mt-0.5 bg-gray-50 px-2 py-1 rounded-md">
                    📄 {recommendation.filePath.split("/").pop()}
                  </div>
                </div>
              </div>
            ) as any,
            description: (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="font-medium">
                      Permanently protected from cleanup
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Database className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="font-medium">
                      Added to protection rules database
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="font-medium">
                      Smart cleanup engine updated
                    </span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Info className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-sm text-emerald-800">
                      <div className="font-semibold mb-1">
                        🎯 Protection Active
                      </div>
                      <div className="text-emerald-700 leading-relaxed">
                        This file is now <strong>permanently protected</strong>{" "}
                        and will be excluded from all future cleanup operations.
                        It will remain safely stored regardless of age, size, or
                        usage patterns.
                      </div>
                      <div className="mt-2 text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md inline-block">
                        ✨ Premium Protection Enabled
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) as any,
            duration: 8000,
            className:
              "border-emerald-200 bg-white shadow-2xl shadow-emerald-500/10 max-w-md",
          });
        } else {
          // Standard toast for other actions
          const actionMessages = {
            DELETE: "File has been marked for deletion",
            ARCHIVE: "File has been marked for archiving",
            COMPRESS: "File has been marked for compression",
          };

          toast({
            title: "Action Executed",
            description:
              actionMessages[
                recommendation.action as keyof typeof actionMessages
              ] ||
              `${recommendation.action} completed for ${recommendation.filePath.split("/").pop()}`,
          });
        }

        // Refresh analysis and protected files if it was a PROTECT action
        if (recommendation.action === "PROTECT") {
          await loadProtectedFiles();
          // Remove the protected file from current recommendations
          setSmartCleanupAnalysis((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              recommendations: prev.recommendations.filter(
                (r: any) => r.filePath !== recommendation.filePath,
              ),
            };
          });
        }
        await runSmartAnalysis();
        await loadStorageStats();
      } else {
        throw new Error("Failed to execute recommendation");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${recommendation.action.toLowerCase()} file`,
        variant: "destructive",
      });
    } finally {
      setExecutingRecommendation(null);
    }
  };

  // Execute all recommendations
  const executeAllRecommendations = async () => {
    if (!smartCleanupAnalysis?.recommendations) return;

    setIsSmartCleanupRunning(true);
    try {
      const response = await fetch("/api/reports/smart-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute_all",
          recommendations: smartCleanupAnalysis.recommendations,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        const protectedCount = data.protectedCount || 0;
        toast({
          title: "Cleanup Complete",
          description: `Executed ${data.executedCount} recommendations, saved ${data.totalSavings.toFixed(1)} MB${protectedCount > 0 ? `, protected ${protectedCount} files` : ""}`,
        });

        // Refresh analysis and protected files
        await runSmartAnalysis();
        await loadStorageStats();
        if (protectedCount > 0) {
          await loadProtectedFiles();
        }
      } else {
        throw new Error("Failed to execute recommendations");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute recommendations",
        variant: "destructive",
      });
    } finally {
      setIsSmartCleanupRunning(false);
    }
  };

  // Execute Smart Cleanup
  const executeSmartCleanup = async () => {
    setIsSmartCleanupRunning(true);
    try {
      const smartPolicies = [
        {
          format: "pdf",
          retentionDays: 90,
          maxFiles: 1000,
          maxSizeGB: 10,
          protectionRules: [],
          priority: "medium",
        },
        {
          format: "xlsx",
          retentionDays: 60,
          maxFiles: 500,
          maxSizeGB: 5,
          protectionRules: [],
          priority: "medium",
        },
        {
          format: "csv",
          retentionDays: 30,
          maxFiles: 200,
          maxSizeGB: 2,
          protectionRules: [],
          priority: "low",
        },
      ];

      const response = await fetch("/api/reports/smart-cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policies: smartPolicies,
          dryRun: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: "Smart Cleanup Complete",
          description: `Processed ${data.data.analyzedFiles || 0} files with ${data.data.recommendations?.length || 0} recommendations`,
        });

        await loadStorageStats();
        await runSmartAnalysis(); // Refresh analysis
      } else {
        throw new Error("Smart cleanup failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute smart cleanup",
        variant: "destructive",
      });
    } finally {
      setIsSmartCleanupRunning(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadStorageStats();
  }, []);

  // Format bytes to human readable
  const formatBytes = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(1)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  // Format date
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
            <Database className="w-6 h-6 text-slate-700" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Intelligent Storage Management
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Automated policies that optimize your report lifecycle, reduce
            costs, and keep your data organized.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
            >
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))
        ) : storageStats ? (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Total Reports
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {storageStats.totalReports}
                  </p>
                  <p className="text-xs text-gray-500">Active documents</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Storage Used
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatBytes(storageStats.totalSizeInMB)}
                  </p>
                  <p className="text-xs text-gray-500">Across all formats</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Oldest Report
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(storageStats.oldestReport)}
                  </p>
                  <p className="text-xs text-gray-500">Retention tracking</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Format Types
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Object.keys(storageStats.reportsByFormat).length}
                  </p>
                  <p className="text-xs text-gray-500">Different formats</p>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-full bg-white border border-gray-200 rounded-xl p-8 text-center">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">No Reports Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Generate some reports to see your storage analytics
            </p>
            <Button onClick={loadStorageStats} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Again
            </Button>
          </div>
        )}
      </div>

      {/* Format Breakdown */}
      {storageStats && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Storage Distribution
                  </h3>
                  <p className="text-sm text-gray-600">
                    Breakdown by report format
                  </p>
                </div>
              </div>
              <Button onClick={loadStorageStats} variant="ghost" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(storageStats.reportsByFormat).map(
                ([format, data]) => (
                  <div
                    key={format}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <Badge variant="secondary" className="mb-1">
                            {format.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-600">
                            {data.count} reports
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-gray-900">
                          {formatBytes(data.sizeInMB)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(
                            (data.sizeInMB / storageStats.totalSizeInMB) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* Retention Policies Section */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Retention Policies
                </h3>
                <p className="text-sm text-gray-600">
                  Configure automated cleanup rules for different report formats
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAllExpanded(!allExpanded)}
              className="text-xs"
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Expand All
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {RETENTION_POLICIES.map((policy) => {
            const Icon = policy.icon;
            const isExpanded =
              expandedPolicies.includes(policy.format) || allExpanded;
            const formatStats =
              storageStats?.reportsByFormat[policy.format.toUpperCase()];

            return (
              <div
                key={policy.format}
                className="border border-gray-200 rounded-lg bg-gray-50/30"
              >
                <button
                  onClick={() => togglePolicyExpansion(policy.format)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        {policy.format.toUpperCase()} Reports
                        {formatStats && (
                          <span className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                            {formatStats.count} files
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {policy.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>{policy.retentionDays} days</span>
                        <span>•</span>
                        <span>{policy.maxFiles} max files</span>
                        <span>•</span>
                        <span>{policy.maxSizeMB}MB limit</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isExpanded
                          ? "bg-slate-100 text-slate-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isExpanded ? "Expanded" : "Collapsed"}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="w-4 h-4" />
                          Retention Period
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="365"
                            defaultValue={policy.retentionDays}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">days</span>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <Hash className="w-4 h-4" />
                          Max Files
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="10000"
                          defaultValue={policy.maxFiles}
                          className="w-24"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <HardDrive className="w-4 h-4" />
                          Size Limit
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            max="10000"
                            defaultValue={policy.maxSizeMB}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-500">MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <h5 className="font-medium text-slate-900 mb-1">
                        Best Practices
                      </h5>
                      <p className="text-sm text-slate-700">
                        {policy.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart Cleanup Engine */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Smart Cleanup Engine
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 text-xs"
                >
                  AI-Powered
                </Badge>
              </h3>
              <p className="text-sm text-gray-600">
                Intelligent analysis and cleanup with predictive recommendations
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {smartCleanupAnalysis && (
            <Alert className="mb-6 border-blue-200 bg-blue-50">
              <Brain className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Smart Analysis Complete:</strong> Analyzed{" "}
                {smartCleanupAnalysis.totalFilesAnalyzed} files, found{" "}
                {smartCleanupAnalysis.recommendations?.length || 0} optimization
                opportunities
                {smartCleanupAnalysis.potentialSavingsMB &&
                  ` with potential savings of ${(smartCleanupAnalysis.potentialSavingsMB / 1024).toFixed(2)} GB`}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    AI Analysis
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get intelligent recommendations for optimization
                  </p>
                </div>
              </div>
              <Button
                onClick={runSmartAnalysis}
                disabled={isSmartAnalyzing}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {isSmartAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Now
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Smart Cleanup
                  </h4>
                  <p className="text-sm text-gray-600">
                    Execute AI-powered cleanup with protection rules
                  </p>
                </div>
              </div>
              <Button
                onClick={executeSmartCleanup}
                disabled={isSmartCleanupRunning}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSmartCleanupRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Smart Cleanup
                  </>
                )}
              </Button>
            </div>
          </div>

          {smartCleanupAnalysis && smartCleanupAnalysis.recommendations && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  AI Recommendations (
                  {smartCleanupAnalysis.recommendations.length})
                </h4>
                <Button
                  size="sm"
                  onClick={executeAllRecommendations}
                  disabled={
                    isSmartCleanupRunning ||
                    smartCleanupAnalysis.recommendations.length === 0
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSmartCleanupRunning ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Execute All
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                {(showAllRecommendations
                  ? smartCleanupAnalysis.recommendations
                  : smartCleanupAnalysis.recommendations.slice(0, 3)
                ).map((rec: any, index: number) => {
                  const isExecuting = executingRecommendation === rec.filePath;
                  const isCompleted = completedRecommendations.has(
                    rec.filePath,
                  );

                  return (
                    <div
                      key={index}
                      className={`flex items-start justify-between p-4 rounded-lg border transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-50 border-emerald-200 opacity-75"
                          : isExecuting
                            ? "bg-blue-50 border-blue-200 shadow-md"
                            : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full mt-1 transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                              : isExecuting
                                ? "bg-blue-500 animate-pulse"
                                : rec.action === "DELETE"
                                  ? "bg-red-500"
                                  : rec.action === "ARCHIVE"
                                    ? "bg-amber-500"
                                    : rec.action === "COMPRESS"
                                      ? "bg-blue-500"
                                      : "bg-emerald-500"
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                rec.action === "DELETE"
                                  ? "bg-red-100 text-red-800"
                                  : rec.action === "ARCHIVE"
                                    ? "bg-amber-100 text-amber-800"
                                    : rec.action === "COMPRESS"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {rec.action}
                            </span>
                            <span className="text-sm text-gray-600 truncate">
                              {rec.filePath.split("/").pop()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                            {rec.reasoning}
                          </p>
                          {rec.potentialSavings > 0 && (
                            <p className="text-sm text-emerald-600 font-medium">
                              💾 Saves {rec.potentialSavings.toFixed(1)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 ml-4">
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${
                              rec.confidence > 0.8
                                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                : rec.confidence > 0.6
                                  ? "border-amber-300 text-amber-700 bg-amber-50"
                                  : "border-red-300 text-red-700 bg-red-50"
                            }`}
                          >
                            {(rec.confidence * 100).toFixed(0)}% confident
                          </Badge>
                          <span
                            className={`text-xs px-2 py-1 rounded-md ${
                              rec.riskLevel === "low"
                                ? "bg-green-100 text-green-700"
                                : rec.riskLevel === "medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {rec.riskLevel} risk
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={
                            isCompleted
                              ? "outline"
                              : rec.action === "DELETE"
                                ? "destructive"
                                : rec.action === "PROTECT"
                                  ? "secondary"
                                  : "default"
                          }
                          className={`text-xs h-8 px-3 font-medium transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : isExecuting
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                          }`}
                          onClick={() => executeRecommendation(rec)}
                          disabled={
                            isSmartCleanupRunning || isExecuting || isCompleted
                          }
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {rec.action === "PROTECT"
                                ? "Protected"
                                : "Completed"}
                            </>
                          ) : isExecuting ? (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              {rec.action === "DELETE"
                                ? "🗑️ Delete"
                                : rec.action === "ARCHIVE"
                                  ? "📦 Archive"
                                  : rec.action === "COMPRESS"
                                    ? "🗜️ Compress"
                                    : "🛡️ Keep"}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {smartCleanupAnalysis.recommendations.length > 3 && (
                  <div className="text-center pt-3 border-t border-gray-100">
                    <button
                      onClick={() =>
                        setShowAllRecommendations(!showAllRecommendations)
                      }
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      {showAllRecommendations ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show {smartCleanupAnalysis.recommendations.length -
                            3}{" "}
                          More Recommendations
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Protected Files Section */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Protected Files</h3>
                <p className="text-sm text-gray-600">
                  Files permanently protected from cleanup operations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-emerald-700 border-emerald-200 bg-emerald-50"
              >
                {protectedFiles.length} protected
              </Badge>
              <button
                onClick={() =>
                  setIsProtectedFilesCollapsed(!isProtectedFilesCollapsed)
                }
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={isProtectedFilesCollapsed ? "Expand" : "Collapse"}
              >
                {isProtectedFilesCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
        {!isProtectedFilesCollapsed && (
          <div className="p-6">
            {isLoadingProtectedFiles ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Loading protected files...
                </span>
              </div>
            ) : protectedFiles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">
                  No files are currently protected
                </p>
                <p className="text-sm text-gray-500">
                  Use the Smart Cleanup Engine to protect important files from
                  deletion
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {protectedFiles.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-emerald-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {rule.filePath?.split("/").pop() ||
                              "Protected File"}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs border-emerald-300 text-emerald-700 bg-emerald-100"
                          >
                            {rule.protectionType}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {rule.filePath}
                        </p>
                        {rule.reason && (
                          <p className="text-xs text-emerald-700 mt-1">
                            {rule.reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Protected {formatDate(rule.createdAt)}
                          {rule.expiresAt &&
                            ` • Expires ${formatDate(rule.expiresAt)}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-amber-600 hover:bg-amber-50 ml-2 flex-shrink-0"
                      onClick={() => handleRemoveProtection(rule.id)}
                      title="Remove protection - This file will become eligible for cleanup operations"
                    >
                      <ShieldOff className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Traditional Cleanup Actions */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Traditional Cleanup
                </h3>
                <p className="text-sm text-gray-600">
                  Rule-based cleanup following your retention policies
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setIsTraditionalCleanupCollapsed(!isTraditionalCleanupCollapsed)
              }
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title={isTraditionalCleanupCollapsed ? "Expand" : "Collapse"}
            >
              {isTraditionalCleanupCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {!isTraditionalCleanupCollapsed && (
          <div className="p-6">
            {lastCleanup && (
              <Alert className="mb-6 border-emerald-200 bg-emerald-50">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <strong>Last cleanup successful:</strong> Deleted{" "}
                  {lastCleanup.deletedReports} reports, freed{" "}
                  {lastCleanup.freedSpace.toFixed(2)} MB
                  {lastCleanup.errors.length > 0 &&
                    ` (${lastCleanup.errors.length} minor issues resolved)`}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Policy-Based Cleanup
                  </h4>
                  <p className="text-sm text-gray-600">
                    Standard cleanup that follows your configured retention
                    policies
                  </p>
                </div>
              </div>
              <Button
                onClick={runCleanup}
                disabled={isCleanupRunning}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {isCleanupRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Run Cleanup Now
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safety Features
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Respects retention policies
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Protects recent reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Removes orphaned files
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Detailed cleanup logs
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Cleanup Rules
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Reports older than max age are deleted</li>
                  <li>• Only recent N reports per config are kept</li>
                  <li>• Size limits trigger oldest-first deletion</li>
                  <li>• Orphaned storage files are cleaned up</li>
                </ul>
              </div>
            </div>

            {lastCleanup?.errors && lastCleanup.errors.length > 0 && (
              <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">
                    Cleanup Issues Resolved:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {lastCleanup.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {lastCleanup.errors.length > 3 && (
                      <li>
                        ... and {lastCleanup.errors.length - 3} more issues
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportStorageSettings;
