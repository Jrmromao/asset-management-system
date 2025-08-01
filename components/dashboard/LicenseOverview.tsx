"use client";
import { Key, AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo, useContext } from "react";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";
import { UserContext } from "@/components/providers/UserContext";
import { AssetBarChart } from "@/components/dashboard/AssetBarChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

export const LicenseOverview = () => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  // Use companyId for filtering licenses by company
  const { licenses, isLoading } = useLicenseQuery(0, 2000, "", {
    companyId: user?.companyId,
  }) as { licenses: any; isLoading: boolean };
  // Type guard for object-with-data
  function hasDataProp(obj: any): obj is { data: any[] } {
    return obj && typeof obj === "object" && Array.isArray(obj.data);
  }
  const safeLicenses = Array.isArray(licenses)
    ? licenses
    : hasDataProp(licenses)
      ? licenses.data
      : [];

  // Calculate expiring soon (within 30 days)
  const expiringSoon = useMemo(() => {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + 30);
    return safeLicenses.filter(
      (license: any) =>
        license.renewalDate &&
        new Date(license.renewalDate) <= threshold &&
        new Date(license.renewalDate) >= now,
    ).length;
  }, [safeLicenses]);

  // Calculate utilization rate (overall: total assigned seats / total seats)
  const utilization = useMemo(() => {
    const withSeats = safeLicenses.filter((l: any) => l.seats && l.seats > 0);
    if (withSeats.length === 0) return 0;
    const totalSeats = withSeats.reduce(
      (sum: number, l: any) => sum + l.seats,
      0,
    );
    const totalAssigned = withSeats.reduce((sum: number, l: any) => {
      if (typeof l.seatsAllocated === "number") {
        return sum + l.seatsAllocated;
      } else if (Array.isArray(l.usedBy)) {
        return sum + l.usedBy.length;
      }
      return sum;
    }, 0);
    return Math.round((totalAssigned / totalSeats) * 100);
  }, [safeLicenses]);

  // Prepare per-license utilization data for the chart
  const licenseUtilizationData = safeLicenses.map((l: any) => ({
    name: l.name,
    value: l.seats > 0 ? Math.round((l.seatsAllocated / l.seats) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>License Management</CardTitle>
          <CardDescription>
            Track software licenses, renewals, and utilization.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/licenses")}
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "--" : safeLicenses?.length}
            </div>
            <div className="text-sm text-gray-600">Active Licenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {isLoading ? "--" : expiringSoon}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
        </div>
        {/* Per-license utilization horizontal bar chart */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">
            Per-License Utilization
          </h3>
          <ResponsiveContainer
            width="100%"
            height={40 + licenseUtilizationData.length * 40}
          >
            <BarChart
              data={licenseUtilizationData}
              layout="vertical"
              margin={{ top: 16, right: 32, left: 120, bottom: 16 }}
              barCategoryGap={16}
            >
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 14, fontWeight: 500, fill: "#334155" }}
                tickFormatter={(name) =>
                  name.length > 18 ? name.slice(0, 15) + "…" : name
                }
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
                tick={{ fontSize: 13, fill: "#64748b" }}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                fill="#2563eb"
                minPointSize={4}
              >
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(v: any) => `${v}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
