"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

interface ReportCategoryCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  link: string;
}

export const ReportCategoryCard = ({
  icon,
  title,
  description,
  link,
}: ReportCategoryCardProps) => {
  const navigate = useRouter();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer min-h-[148px] min-w-[0] flex flex-col justify-center items-center text-center px-4 py-6"
      onClick={() => navigate.push(link)}
    >
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-base font-semibold mb-1 whitespace-nowrap overflow-hidden text-ellipsis w-full">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500 leading-snug w-full max-w-[180px] mx-auto truncate">
          {description}
        </CardDescription>
      </div>
    </Card>
  );
};
