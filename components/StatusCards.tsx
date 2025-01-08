import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedCounter from "@/components/AnimatedCounter";

interface StatusCardData {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
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

  return (
    <div className={`grid grid-cols-1 ${getGridCols()} gap-4`}>
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold">
                <AnimatedCounter
                  value={Number(card.value)}
                  duration={0.3}
                  decimals={0}
                />
              </p>
              {card.subtitle && (
                <div className="flex items-center text-sm text-gray-500">
                  {card.icon}
                  <span className="ml-1">{card.subtitle}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
