import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FormProgressSkeleton = () => {
  return (
    <div className="col-span-12 lg:col-span-4 space-y-6">
      <div className="sticky top-[104px]">
        <Card className="bg-white">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-medium">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse" />
                      <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-5 rounded-full bg-slate-200 animate-pulse" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormProgressSkeleton;
