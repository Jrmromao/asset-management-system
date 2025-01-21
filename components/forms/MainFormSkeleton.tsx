import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const MainFormSkeleton = () => {
  // Helper function to render a skeleton field (with or without button)
  const SkeletonField = ({ hasButton = false }) => (
    <div className="space-y-2 w-full">
      <div className="flex gap-1 items-center">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
        {hasButton && (
          <div className="h-10 w-10 bg-slate-200 rounded animate-pulse" />
        )}
      </div>
    </div>
  );

  // Helper function to render a section title
  const SectionTitle = () => (
    <div className="pb-6">
      <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
    </div>
  );

  return (
    <div className="col-span-12 lg:col-span-8 space-y-6">
      <Card className="bg-white">
        <CardContent className="divide-y divide-slate-100">
          <div className="space-y-6 py-6">
            <SectionTitle />
            <SkeletonField hasButton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonField />
              <SkeletonField />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonField hasButton />
              <SkeletonField />
            </div>
          </div>

          <div className="space-y-6 py-6">
            <SectionTitle />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonField />
                <SkeletonField />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonField />
                <SkeletonField />
              </div>
              <SkeletonField hasButton />
              <SkeletonField hasButton />
            </div>
          </div>

          <div className="space-y-6 py-6">
            <SectionTitle />
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkeletonField />
                <SkeletonField />
              </div>

              <SkeletonField hasButton />
              <SkeletonField hasButton />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MainFormSkeleton;
