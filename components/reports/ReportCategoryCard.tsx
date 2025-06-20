"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface ReportCategoryCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
}

export const ReportCategoryCard = ({ icon, title, description, link }: ReportCategoryCardProps) => {
  const navigate = useRouter();

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate.push(link)}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        {icon}
        <div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}; 