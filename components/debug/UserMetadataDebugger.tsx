"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useUserMetadataSync } from "@/hooks/useUserMetadataSync";
import { toast } from "@/hooks/use-toast";

interface UserDebugInfo {
  timestamp: string;
  userId: string;
  database: {
    userFound: boolean;
    user: any;
    company: any;
    role: any;
  };
  clerk: {
    userFound: boolean;
    publicMetadata: any;
    privateMetadata: any;
    organizations: any[];
  };
  companies: {
    total: number;
    list: any[];
  };
  issues: string[];
  recommendations: string[];
}

export function UserMetadataDebugger() {
  const [debugInfo, setDebugInfo] = useState<UserDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { syncUserMetadata, isLoading: isSyncing } = useUserMetadataSync();

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/debug/user-status");
      if (!response.ok) {
        throw new Error("Failed to fetch debug info");
      }
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user debug information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    const result = await syncUserMetadata();
    if (result.success) {
      // Refresh debug info after sync
      await fetchDebugInfo();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            User Metadata Debugger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={fetchDebugInfo}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Status
            </Button>

            <Button onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Sync Metadata
            </Button>
          </div>

          {debugInfo && (
            <div className="space-y-4">
              {/* Issues */}
              {debugInfo.issues.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600 text-sm">
                      Issues Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {debugInfo.issues.map((issue, index) => (
                        <li
                          key={index}
                          className="text-sm text-red-600 flex items-center gap-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {debugInfo.recommendations.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader>
                    <CardTitle className="text-yellow-600 text-sm">
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {debugInfo.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-yellow-600">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Database Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Database Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        debugInfo.database.userFound ? "default" : "destructive"
                      }
                    >
                      User Found: {debugInfo.database.userFound ? "Yes" : "No"}
                    </Badge>
                  </div>

                  {debugInfo.database.user && (
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>User ID:</strong> {debugInfo.database.user.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {debugInfo.database.user.email}
                      </p>
                      <p>
                        <strong>Company ID:</strong>{" "}
                        {debugInfo.database.user.companyId || "None"}
                      </p>
                      <p>
                        <strong>Role ID:</strong>{" "}
                        {debugInfo.database.user.roleId || "None"}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {debugInfo.database.user.status}
                      </p>
                    </div>
                  )}

                  {debugInfo.database.company && (
                    <div className="text-sm space-y-1 mt-2">
                      <p>
                        <strong>Company:</strong>{" "}
                        {debugInfo.database.company.name}
                      </p>
                      <p>
                        <strong>Company Status:</strong>{" "}
                        {debugInfo.database.company.status}
                      </p>
                      <p>
                        <strong>Clerk Org ID:</strong>{" "}
                        {debugInfo.database.company.clerkOrgId || "None"}
                      </p>
                    </div>
                  )}

                  {debugInfo.database.role && (
                    <div className="text-sm space-y-1 mt-2">
                      <p>
                        <strong>Role:</strong> {debugInfo.database.role.name}
                      </p>
                      <p>
                        <strong>Is Admin:</strong>{" "}
                        {debugInfo.database.role.isAdmin ? "Yes" : "No"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clerk Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Clerk Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        debugInfo.clerk.userFound ? "default" : "destructive"
                      }
                    >
                      User Found: {debugInfo.clerk.userFound ? "Yes" : "No"}
                    </Badge>
                  </div>

                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Public Metadata:</strong>
                    </p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(debugInfo.clerk.publicMetadata, null, 2)}
                    </pre>
                  </div>

                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Private Metadata:</strong>
                    </p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(debugInfo.clerk.privateMetadata, null, 2)}
                    </pre>
                  </div>

                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Organizations:</strong>
                    </p>
                    {debugInfo.clerk.organizations.length > 0 ? (
                      <ul className="space-y-1">
                        {debugInfo.clerk.organizations.map((org, index) => (
                          <li key={index} className="text-xs">
                            {org.name} ({org.role})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500">No organizations</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Companies List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Available Companies ({debugInfo.companies.total})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debugInfo.companies.list.map((company) => (
                      <div
                        key={company.id}
                        className="text-sm p-2 border rounded"
                      >
                        <p>
                          <strong>{company.name}</strong>
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {company.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          Status: {company.status}
                        </p>
                        <p className="text-xs text-gray-500">
                          Users: {company._count.users}
                        </p>
                        <p className="text-xs text-gray-500">
                          Clerk Org: {company.clerkOrgId || "None"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-xs text-gray-500">
                Last checked: {new Date(debugInfo.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
