"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { aiService } from "@/lib/services/ai-multi-provider.service";
import type { AIProvider } from "@/lib/services/ai-multi-provider.service";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

interface ProviderStatus {
  openai: boolean;
  deepseek: boolean;
  gemini: boolean;
}

interface TestResult {
  success: boolean;
  provider?: AIProvider;
  error?: string;
  duration?: number;
}

export function AIProviderStatus() {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    openai: false,
    deepseek: false,
    gemini: false,
  });
  const [testResults, setTestResults] = useState<
    Record<AIProvider, TestResult | null>
  >({
    openai: null,
    deepseek: null,
    gemini: null,
  });
  const [testing, setTesting] = useState<AIProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check provider status on component mount
    const status = aiService.getProviderStatus();
    setProviderStatus(status);
    setIsLoading(false);
  }, []);

  const getStatusIcon = (isAvailable: boolean) => {
    if (isAvailable) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return (
      <Badge variant={isAvailable ? "default" : "destructive"}>
        {isAvailable ? "Available" : "Unavailable"}
      </Badge>
    );
  };

  const testProvider = async (provider: AIProvider) => {
    setTesting(provider);
    const startTime = Date.now();

    try {
      // Test with a simple asset calculation
      const result = await aiService.calculateAssetCO2WithFallback(
        "Test Laptop",
        "Dell",
        "Latitude 5520",
        provider, // Force specific provider
      );

      const duration = Date.now() - startTime;

      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: result.success,
          provider: result.provider,
          error: result.error,
          duration,
        },
      }));
    } catch (error) {
      const duration = Date.now() - startTime;
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          duration,
        },
      }));
    } finally {
      setTesting(null);
    }
  };

  const testAllProviders = async () => {
    const availableProviders = aiService.getAvailableProviders();

    for (const provider of availableProviders) {
      await testProvider(provider);
      // Small delay between tests to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  const getTestResultIcon = (result: TestResult | null) => {
    if (!result) return null;

    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading AI Provider Status...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const availableCount = Object.values(providerStatus).filter(Boolean).length;
  const totalProviders = Object.keys(providerStatus).length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Provider Status
            <Badge variant={availableCount > 0 ? "default" : "destructive"}>
              {availableCount}/{totalProviders} Available
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableCount === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No AI providers are available. Please check your API keys in
                environment variables.
              </AlertDescription>
            </Alert>
          )}

          {availableCount > 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {availableCount === 1
                  ? "1 provider is available. Consider adding backup providers for redundancy."
                  : `${availableCount} providers are available. Automatic fallback is enabled.`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Provider Details */}
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.entries(providerStatus) as [AIProvider, boolean][]).map(
          ([provider, isAvailable]) => (
            <Card key={provider}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(isAvailable)}
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </div>
                  {getStatusBadge(isAvailable)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Configuration Status */}
                <div className="text-sm text-muted-foreground">
                  {isAvailable ? (
                    <span className="text-green-600">API key configured</span>
                  ) : (
                    <span className="text-red-600">API key missing</span>
                  )}
                </div>

                {/* Test Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testProvider(provider)}
                  disabled={!isAvailable || testing === provider}
                  className="w-full"
                >
                  {testing === provider ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Provider"
                  )}
                </Button>

                {/* Test Results */}
                {testResults[provider] && (
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      {getTestResultIcon(testResults[provider])}
                      <span
                        className={
                          testResults[provider]?.success
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {testResults[provider]?.success
                          ? "Test Passed"
                          : "Test Failed"}
                      </span>
                    </div>

                    {testResults[provider]?.duration && (
                      <div className="text-muted-foreground">
                        Response time: {testResults[provider]?.duration}ms
                      </div>
                    )}

                    {testResults[provider]?.error && (
                      <div className="text-red-600 text-xs">
                        {testResults[provider]?.error}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ),
        )}
      </div>

      {/* Bulk Test */}
      {availableCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test All Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testAllProviders}
              disabled={testing !== null}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Providers...
                </>
              ) : (
                "Test All Available Providers"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            To enable additional providers, add these environment variables:
          </div>
          <div className="bg-muted p-3 rounded text-xs font-mono space-y-1">
            <div>OPENAI_API_KEY=your_openai_key</div>
            <div>DEEPSEEK_API_KEY=your_deepseek_key</div>
            <div>GEMINI_API_KEY=your_gemini_key</div>
          </div>
          <div className="text-xs text-muted-foreground">
            See the AI Providers Setup Guide for detailed instructions.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
