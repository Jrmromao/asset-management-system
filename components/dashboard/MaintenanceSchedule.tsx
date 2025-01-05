import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Leaf } from "lucide-react";

interface MaintenanceItemProps {
  asset: string;
  type: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  impact: number;
}

const MaintenanceItem = ({
  asset,
  type,
  dueDate,
  priority,
  impact,
}: MaintenanceItemProps) => {
  const priorityColors = {
    low: "text-blue-600 bg-blue-50",
    medium: "text-amber-600 bg-amber-50",
    high: "text-red-600 bg-red-50",
  };

  return (
    <div className="p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{asset}</h4>
          <p className="text-sm text-gray-500">{type}</p>
        </div>
        <Badge className={priorityColors[priority]}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-4 w-4" />
          {dueDate}
        </div>
        <div className="flex items-center gap-1">
          <Leaf className="h-4 w-4 text-emerald-600" />
          <span className="text-gray-600">{impact}kg CO₂</span>
        </div>
      </div>
    </div>
  );
};

export const MaintenanceScheduleCard = () => {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Maintenance Schedule
          </CardTitle>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <MaintenanceItem
            asset="Laptop XPS-15"
            type="Routine Check"
            dueDate="Tomorrow"
            priority="high"
            impact={25}
          />
          <MaintenanceItem
            asset="Monitor U2719D"
            type="Calibration"
            dueDate="Next Week"
            priority="medium"
            impact={15}
          />
          <MaintenanceItem
            asset="Mobile Device"
            type="Battery Check"
            dueDate="2 Weeks"
            priority="low"
            impact={10}
          />
        </div>
      </CardContent>
    </Card>
  );
};
