import React from "react";
import { Card } from "@/components/ui/card";

const FormSectionSkeleton = ({ numberOfFields = 4 }) => {
  // Helper function to render a skeleton field
  const SkeletonField = () => (
    <div className="space-y-2 w-full">
      {/* Label with required asterisk */}
      <div className="flex gap-1 items-center">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-3 bg-red-200 rounded animate-pulse" />
      </div>
      {/* Input field */}
      <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
    </div>
  );

  return (
    <Card className="p-6 space-y-6">
      {/* Section title */}
      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />

      {/* Category badge */}
      <div className="flex items-center gap-2">
        <div className="w-36 h-6 rounded-full bg-blue-50 border border-blue-100 animate-pulse" />
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array(numberOfFields)
          .fill(0)
          .map((_, index) => (
            <SkeletonField key={index} />
          ))}
      </div>
    </Card>
  );
};

export default FormSectionSkeleton;
