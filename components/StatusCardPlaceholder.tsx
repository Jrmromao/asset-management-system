"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const StatusCardPlaceholder = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="bg-card">
          <CardHeader className="pb-2">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-300 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCardPlaceholder;
