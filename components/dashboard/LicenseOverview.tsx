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
import { useMemo } from "react";
import { useLicenseQuery } from "@/hooks/queries/useLicenseQuery";

export const LicenseOverview = () => {
  const router = useRouter();
  const { licenses = [], isLoading } = useLicenseQuery();

  // Calculate expiring soon (within 30 days)
  const expiringSoon = useMemo(() => {
    const now = new Date();
    const threshold = new Date();
    threshold.setDate(now.getDate() + 30);
    return licenses.filter(
      (license) =>
        license.renewalDate &&
        new Date(license.renewalDate) <= threshold &&
        new Date(license.renewalDate) >= now,
    ).length;
  }, [licenses]);

  // Calculate utilization rate (average of all licenses with seats > 0)
  const utilization = useMemo(() => {
    const withSeats = licenses.filter((l) => l.seats && l.seats > 0);
    if (withSeats.length === 0) return 0;
    const totalUtil = withSeats.reduce((sum, l) => {
      // Prefer utilizationRate field, fallback to userLicenses length
      if (typeof l.utilizationRate === "number") {
        return sum + l.utilizationRate * 100; // utilizationRate is 0-1
      } else if (Array.isArray(l.userLicenses)) {
        return sum + (l.userLicenses.length / l.seats) * 100;
      }
      return sum;
    }, 0);
    return Math.round(totalUtil / withSeats.length);
  }, [licenses]);

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
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? "--" : licenses.length}
            </div>
            <div className="text-sm text-gray-600">Active Licenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {isLoading ? "--" : expiringSoon}
            </div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? "--" : `${utilization}%`}
            </div>
            <div className="text-sm text-gray-600">Utilization</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
