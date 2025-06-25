import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <Card
      className={`dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>

        {actionText && onAction && (
          <Button onClick={onAction} className="inline-flex items-center">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
