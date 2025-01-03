import React from "react";
import { Card } from "@/components/ui/card";

const UserProfileSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
        <span>›</span>
        <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Profile Info Card */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
              <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        <div className="h-9 w-28 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Tabs */}
      <div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center py-16">
          <div className="h-20 w-20 bg-gray-200 animate-pulse rounded-full" />
          <div className="mt-6 space-y-2 w-64">
            <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mx-auto" />
            <div className="h-16 bg-gray-200 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSkeleton;
