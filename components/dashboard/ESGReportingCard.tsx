"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const ESGReportingCard = () => {
  const navigate = useRouter();

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            ESG Reporting Hub
          </CardTitle>
          <BarChart className="h-4 w-4 text-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Generate and view detailed reports on your asset portfolio's environmental impact and lifecycle.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate.push("/dashboard/reporting")}
        >
          Go to Reports <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}; 