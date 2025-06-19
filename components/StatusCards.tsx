import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatusCardData {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: "default" | "success" | "warning" | "danger" | "info";
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  percentage?: number;
  total?: number;
}

interface StatusCardsProps {
  cards: StatusCardData[];
  columns?: 1 | 2 | 3 | 4;
}

const StatusCards: React.FC<StatusCardsProps> = ({ cards, columns = 4 }) => {
  const getColorClass = (color?: string) => {
    switch (color) {
      case "success":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      case "warning":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "danger":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "info":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className={cn("grid gap-4", {
      "grid-cols-1": columns === 1,
      "grid-cols-2": columns === 2,
      "grid-cols-3": columns === 3,
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
    })}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="h-full"
        >
          <Card className="h-full overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-gray-800/30 dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="flex h-full flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                    {card.title}
                  </p>
                  <div className="flex items-baseline">
                    <h2 className="text-2xl font-bold tracking-tight dark:text-white">
                      {card.value}
                    </h2>
                    {card.total && (
                      <span className="ml-2 text-sm text-muted-foreground dark:text-gray-400">
                        of {card.total}
                      </span>
                    )}
                  </div>
                </div>
                {card.icon && (
                  <div className={cn("rounded-full p-2", getColorClass(card.color))}>
                    {card.icon}
                  </div>
                )}
              </div>
              
              <div className="mt-auto">
                {(card.trend || card.subtitle) && (
                  <div className="mt-4 flex items-center space-x-2 text-sm">
                    {card.trend && (
                      <div className="flex items-center">
                        {getTrendIcon(card.trend)}
                        <span className={cn("ml-1", {
                          "text-green-600 dark:text-green-400": card.trend === "up",
                          "text-red-600 dark:text-red-400": card.trend === "down",
                          "text-gray-600 dark:text-gray-400": card.trend === "neutral"
                        })}>
                          {card.trendValue}
                        </span>
                      </div>
                    )}
                    {card.subtitle && (
                      <span className="text-muted-foreground dark:text-gray-400">{card.subtitle}</span>
                    )}
                  </div>
                )}
                
                {card.percentage !== undefined && (
                  <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={cn("h-1.5 rounded-full transition-all", {
                        "bg-green-500 dark:bg-green-400": card.percentage > 66,
                        "bg-yellow-500 dark:bg-yellow-400": card.percentage > 33 && card.percentage <= 66,
                        "bg-red-500 dark:bg-red-400": card.percentage <= 33
                      })}
                      style={{ width: `${card.percentage}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatusCards;
