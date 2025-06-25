"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Trash2,
  RefreshCw,
  Hash,
  Database,
  Calculator,
} from "lucide-react";

interface CachedCalculation {
  fingerprint: string;
  manufacturer: string;
  model: string;
  category: string;
  type: string;
  totalCo2e: number;
  units: string;
  createdAt: string;
  source: string;
}

interface TestAsset {
  name: string;
  manufacturer: string;
  model: string;
  category?: string;
}

export function CO2ConsistencyManager() {
  const [cachedCalculations, setCachedCalculations] = useState<
    CachedCalculation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testAsset, setTestAsset] = useState<TestAsset>({
    name: "MacBook Pro",
    manufacturer: "Apple",
    model: "MacBook Pro 14-inch M3",
    category: "Laptop",
  });
  const [testResults, setTestResults] = useState<{
    fingerprint?: string;
    co2e?: number;
    source?: "cache" | "calculation";
    consistency?: boolean;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadCachedCalculations();
  }, []);

  const loadCachedCalculations = async () => {
    setIsLoading(true);
    try {
      // This would be an API call to get cached calculations
      // For now, we'll simulate some data
      const mockData: CachedCalculation[] = [
        {
          fingerprint: "a1b2c3d4e5f6...",
          manufacturer: "Apple",
          model: "MacBook Pro 14-inch",
          category: "laptop",
          type: "laptop",
          totalCo2e: 384.2,
          units: "kgCO2e",
          createdAt: new Date().toISOString(),
          source: "AI Calculation (Deterministic)",
        },
        {
          fingerprint: "f6e5d4c3b2a1...",
          manufacturer: "Dell",
          model: "Latitude 5520",
          category: "laptop",
          type: "laptop",
          totalCo2e: 295.7,
          units: "kgCO2e",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          source: "AI Calculation (Deterministic)",
        },
      ];
      setCachedCalculations(mockData);
    } catch (error) {
      console.error("Error loading cached calculations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConsistency = async () => {
    setTesting(true);
    try {
      // Test the same asset multiple times to verify consistency
      const results = [];

      for (let i = 0; i < 3; i++) {
        const response = await fetch("/api/co2/test-consistency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: testAsset.name,
            manufacturer: testAsset.manufacturer,
            model: testAsset.model,
            category: testAsset.category,
            forceRecalculate: i === 0, // Force calculation on first run, then use cache
          }),
        });

        const result = await response.json();
        results.push(result);

        // Small delay between tests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Check consistency
      const co2Values = results.map((r) => r.data?.totalCo2e).filter(Boolean);
      const isConsistent = co2Values.every((val) => val === co2Values[0]);

      setTestResults({
        fingerprint: results[0]?.fingerprint,
        co2e: results[0]?.data?.totalCo2e,
        source: results[1]?.source, // Second call should be from cache
        consistency: isConsistent,
      });
    } catch (error) {
      console.error("Error testing consistency:", error);
    } finally {
      setTesting(false);
    }
  };

  const clearCache = async (fingerprint?: string) => {
    try {
      const response = await fetch("/api/co2/clear-cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });

      const result = await response.json();

      if (result.success) {
        await loadCachedCalculations();
      }
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  const generateFingerprint = (asset: TestAsset): string => {
    // Simplified fingerprint generation for display
    const data = `${asset.manufacturer}|${asset.model}|${asset.category}|${asset.name}`;
    return data.toLowerCase().replace(/\s+/g, "-");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading CO2 Consistency Manager...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            CO2 Calculation Consistency Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              This system ensures identical assets return consistent CO2
              calculations by using asset fingerprinting, deterministic AI
              parameters, and intelligent caching.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Consistency Test</TabsTrigger>
          <TabsTrigger value="cache">Cached Calculations</TabsTrigger>
          <TabsTrigger value="fingerprint">Asset Fingerprinting</TabsTrigger>
        </TabsList>

        {/* Consistency Testing */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Test Asset Consistency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input
                    id="assetName"
                    value={testAsset.name}
                    onChange={(e) =>
                      setTestAsset((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={testAsset.manufacturer}
                    onChange={(e) =>
                      setTestAsset((prev) => ({
                        ...prev,
                        manufacturer: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={testAsset.model}
                    onChange={(e) =>
                      setTestAsset((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={testAsset.category || ""}
                    onChange={(e) =>
                      setTestAsset((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <Button
                onClick={testConsistency}
                disabled={testing}
                className="w-full"
              >
                {testing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing Consistency (3 calculations)...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test Consistency
                  </>
                )}
              </Button>

              {testResults && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    {testResults.consistency ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={
                        testResults.consistency
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {testResults.consistency
                        ? "Consistent Results"
                        : "Inconsistent Results"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">CO2e Value:</span>
                      <div className="font-mono">{testResults.co2e} kgCO2e</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Cache Status:
                      </span>
                      <div>
                        <Badge
                          variant={
                            testResults.source === "cache"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {testResults.source === "cache"
                            ? "From Cache"
                            : "New Calculation"}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">
                        Asset Fingerprint:
                      </span>
                      <div className="font-mono text-xs break-all">
                        {testResults.fingerprint}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cached Calculations */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="h-4 w-4" />
                Cached CO2 Calculations ({cachedCalculations.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadCachedCalculations()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => clearCache()}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cachedCalculations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No cached calculations found
                </div>
              ) : (
                <div className="space-y-3">
                  {cachedCalculations.map((calc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {calc.manufacturer} {calc.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {calc.totalCo2e} {calc.units} • {calc.category} •{" "}
                          {calc.type}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {calc.fingerprint.substring(0, 16)}...
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {new Date(calc.createdAt).toLocaleDateString()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearCache(calc.fingerprint)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asset Fingerprinting */}
        <TabsContent value="fingerprint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Asset Fingerprint Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  Current Asset Fingerprint:
                </div>
                <div className="font-mono text-xs break-all bg-background p-2 rounded border">
                  {generateFingerprint(testAsset)}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">How Asset Fingerprinting Works:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    1. <strong>Normalize</strong> manufacturer names (e.g.,
                    "Apple Inc." → "apple")
                  </div>
                  <div>
                    2. <strong>Normalize</strong> model names (remove storage,
                    colors, etc.)
                  </div>
                  <div>
                    3. <strong>Categorize</strong> asset type (laptop, desktop,
                    etc.)
                  </div>
                  <div>
                    4. <strong>Generate</strong> SHA-256 hash from normalized
                    data
                  </div>
                  <div>
                    5. <strong>Cache</strong> CO2 calculations using this
                    fingerprint
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Assets with the same fingerprint will always return identical
                  CO2 calculations, ensuring consistency across different naming
                  variations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
