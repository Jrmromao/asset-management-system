import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusCardData {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  percentage?: number;
  total?: number;
}

interface StatusCardsProps {
  cards: StatusCardData[];
  columns?: 1 | 2 | 3 | 4;
}

const StatusCards = ({ cards, columns = 3 }: StatusCardsProps) => {
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return "md:grid-cols-1";
      case 2:
        return "md:grid-cols-2";
      case 4:
        return "md:grid-cols-4";
      default:
        return "md:grid-cols-3";
    }
  };

  const getValueColor = (color?: string) => {
    switch (color) {
      case "yellow":
        return "text-yellow-600";
      case "red":
        return "text-red-600";
      case "green":
        return "text-green-600";
      case "blue":
        return "text-blue-600";
      default:
        return "";
    }
  };

  return (
    <div className={`grid grid-cols-1 ${getGridCols()} gap-4`}>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getValueColor(card.color)}`}>
              {card.value}
            </div>
            {(card.percentage || card.subtitle) && (
              <p className="text-xs text-muted-foreground mt-1">
                {card.percentage && card.total
                  ? `${(card.percentage / card.total) * 100}% of total`
                  : card.subtitle}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
