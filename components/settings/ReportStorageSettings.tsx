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
  Archive
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
    format: 'pdf',
    icon: FileText,
    description: 'Official documents and archives',
    retentionDays: 90,
    maxFiles: 50,
    maxSizeMB: 500,
    recommendation: 'PDFs are ideal for long-term storage. Consider extending retention for compliance requirements.'
  },
  {
    format: 'excel',
    icon: BarChart3,
    description: 'Data analysis and business reports',
    retentionDays: 60,
    maxFiles: 30,
    maxSizeMB: 200,
    recommendation: 'Excel files balance accessibility with storage costs. Perfect for monthly business reviews.'
  },
  {
    format: 'csv',
    icon: Database,
    description: 'Data exports and quick analysis',
    retentionDays: 30,
    maxFiles: 20,
    maxSizeMB: 100,
    recommendation: 'CSV exports are optimized for frequent access and quick cleanup cycles.'
  },
  {
    format: 'dashboard',
    icon: TrendingUp,
    description: 'Real-time insights and interactive data',
    retentionDays: 7,
    maxFiles: 10,
    maxSizeMB: 50,
    recommendation: 'Dashboard reports prioritize recent data with aggressive cleanup for optimal performance.'
  }
];

const ReportStorageSettings = () => {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [policies, setPolicies] = useState<Record<string, RetentionPolicy>>(DEFAULT_POLICIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isCleanupRunning, setIsCleanupRunning] = useState(false);
  const [lastCleanup, setLastCleanup] = useState<CleanupStats | null>(null);
  const [expandedPolicies, setExpandedPolicies] = useState<string[]>([]);
  const [allExpanded, setAllExpanded] = useState(false);
  const [smartCleanupAnalysis, setSmartCleanupAnalysis] = useState<any>(null);
  const [isSmartAnalyzing, setIsSmartAnalyzing] = useState(false);
  const [isSmartCleanupRunning, setIsSmartCleanupRunning] = useState(false);

  // Load storage statistics
  const loadStorageStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reports/cleanup');
      if (response.ok) {
        const data = await response.json();
        setStorageStats(data.stats);
      } else {
        throw new Error('Failed to load storage statistics');
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

  // Run cleanup
  const runCleanup = async () => {
    setIsCleanupRunning(true);
    try {
      const response = await fetch('/api/reports/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'cleanup',
          customPolicies: policies
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
        throw new Error('Cleanup failed');
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
    setExpandedPolicies(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  // Run Smart Cleanup Analysis
  const runSmartAnalysis = async () => {
    setIsSmartAnalyzing(true);
    try {
      const response = await fetch('/api/reports/smart-cleanup?action=recommendations');
      if (response.ok) {
        const data = await response.json();
        setSmartCleanupAnalysis(data.data);
        
        toast({
          title: "Smart Analysis Complete",
          description: `Analyzed ${data.data.totalFilesAnalyzed} files with ${data.data.recommendations.length} recommendations`,
        });
      } else {
        throw new Error('Smart analysis failed');
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

      const response = await fetch('/api/reports/smart-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          policies: smartPolicies,
          dryRun: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Smart Cleanup Complete",
          description: `Processed ${data.data.totalFilesAnalyzed} files, saved ${(data.data.spaceSaved / 1024 / 1024).toFixed(2)} MB`,
        });

        await loadStorageStats();
        await runSmartAnalysis(); // Refresh analysis
      } else {
        throw new Error('Smart cleanup failed');
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
    if (!date) return 'N/A';
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
            Automated policies that optimize your report lifecycle, reduce costs, and keep your data organized.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))
        ) : storageStats ? (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Total Reports</p>
                  <p className="text-2xl font-semibold text-gray-900">{storageStats.totalReports}</p>
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
                  <p className="text-xs font-medium text-gray-600 mb-1">Storage Used</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatBytes(storageStats.totalSizeInMB)}</p>
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
                  <p className="text-xs font-medium text-gray-600 mb-1">Oldest Report</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(storageStats.oldestReport)}</p>
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
                  <p className="text-xs font-medium text-gray-600 mb-1">Format Types</p>
                  <p className="text-2xl font-semibold text-gray-900">{Object.keys(storageStats.reportsByFormat).length}</p>
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
            <p className="text-sm text-gray-600 mb-4">Generate some reports to see your storage analytics</p>
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
                  <h3 className="font-semibold text-gray-900">Storage Distribution</h3>
                  <p className="text-sm text-gray-600">Breakdown by report format</p>
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
              {Object.entries(storageStats.reportsByFormat).map(([format, data]) => (
                <div key={format} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
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
                        {((data.sizeInMB / storageStats.totalSizeInMB) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                <h3 className="font-semibold text-gray-900">Retention Policies</h3>
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
            const isExpanded = expandedPolicies.includes(policy.format) || allExpanded;
            const formatStats = storageStats?.reportsByFormat[policy.format.toUpperCase()];
            
            return (
              <div key={policy.format} className="border border-gray-200 rounded-lg bg-gray-50/30">
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
                      <p className="text-sm text-gray-600">{policy.description}</p>
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
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      isExpanded 
                        ? 'bg-slate-100 text-slate-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isExpanded ? 'Expanded' : 'Collapsed'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
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
                      <h5 className="font-medium text-slate-900 mb-1">Best Practices</h5>
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
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
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
                <strong>Smart Analysis Complete:</strong> Analyzed {smartCleanupAnalysis.totalFilesAnalyzed} files, 
                found {smartCleanupAnalysis.recommendations?.length || 0} optimization opportunities
                {smartCleanupAnalysis.potentialSavingsMB && 
                  ` with potential savings of ${(smartCleanupAnalysis.potentialSavingsMB / 1024).toFixed(2)} GB`
                }
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
                  <h4 className="font-semibold text-gray-900 mb-1">AI Analysis</h4>
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
                  <h4 className="font-semibold text-gray-900 mb-1">Smart Cleanup</h4>
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
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {smartCleanupAnalysis.recommendations.slice(0, 3).map((rec: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        rec.action === 'DELETE' ? 'bg-red-500' :
                        rec.action === 'ARCHIVE' ? 'bg-yellow-500' :
                        rec.action === 'COMPRESS' ? 'bg-blue-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rec.action}</p>
                        <p className="text-xs text-gray-600">{rec.reasoning}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={`text-xs ${
                        rec.confidence > 0.8 ? 'border-green-300 text-green-700' :
                        rec.confidence > 0.6 ? 'border-yellow-300 text-yellow-700' :
                        'border-red-300 text-red-700'
                      }`}>
                        {(rec.confidence * 100).toFixed(0)}% confident
                      </Badge>
                    </div>
                  </div>
                ))}
                {smartCleanupAnalysis.recommendations.length > 3 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{smartCleanupAnalysis.recommendations.length - 3} more recommendations
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Traditional Cleanup Actions */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Traditional Cleanup</h3>
              <p className="text-sm text-gray-600">
                Rule-based cleanup following your retention policies
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {lastCleanup && (
            <Alert className="mb-6 border-emerald-200 bg-emerald-50">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                <strong>Last cleanup successful:</strong> Deleted {lastCleanup.deletedReports} reports, 
                freed {lastCleanup.freedSpace.toFixed(2)} MB
                {lastCleanup.errors.length > 0 && ` (${lastCleanup.errors.length} minor issues resolved)`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Policy-Based Cleanup</h4>
                <p className="text-sm text-gray-600">
                  Standard cleanup that follows your configured retention policies
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
                <div className="font-medium mb-2">Cleanup Issues Resolved:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {lastCleanup.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {lastCleanup.errors.length > 3 && (
                    <li>... and {lastCleanup.errors.length - 3} more issues</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportStorageSettings; 