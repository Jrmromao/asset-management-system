"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getMaintenanceSchedule } from "@/lib/actions/inventory.actions";
import { updateMaintenanceStatus } from "@/lib/actions/maintenance.actions";
import { ScheduleMaintenanceDialog } from "@/components/dialogs/ScheduleMaintenanceDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface MaintenanceItemProps {
  assetId: string;
  asset: string;
  type: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  impact: number;
  status: string;
  maintenanceId?: string;
}

const MaintenanceItem = ({
  assetId,
  asset,
  type,
  dueDate,
  priority,
  impact,
  status,
  maintenanceId,
}: MaintenanceItemProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const priorityColors = {
    low: "text-blue-600 bg-blue-50 border-blue-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    high: "text-red-600 bg-red-50 border-red-200",
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "in progress":
        return <Play className="h-4 w-4 text-amber-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!maintenanceId) return;

    setIsUpdating(true);
    try {
      const response = await updateMaintenanceStatus(maintenanceId, newStatus);
      if (response.success) {
        toast.success(`Maintenance status updated to ${newStatus}`);
      } else {
        toast.error(response.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-white space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{asset}</h4>
          <p className="text-sm text-gray-500">{type}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <Badge className={priorityColors[priority]}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        </div>
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

      {/* Quick Actions */}
      {maintenanceId && status.toLowerCase() === "scheduled" && (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("In Progress")}
            disabled={isUpdating}
            className="text-xs"
          >
            Start
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate("Completed")}
            disabled={isUpdating}
            className="text-xs"
          >
            Complete
          </Button>
        </div>
      )}
    </div>
  );
};

export const MaintenanceScheduleCard = () => {
  const [schedule, setSchedule] = useState<MaintenanceItemProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await getMaintenanceSchedule();
        if (response.success && response.data) {
          setSchedule(response.data);
        } else {
          console.error(
            "Failed to fetch maintenance schedule:",
            response.error,
          );
          // Fallback to empty array if API fails
          setSchedule([]);
        }
      } catch (error) {
        console.error("Error fetching maintenance schedule:", error);
        setSchedule([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleScheduleSuccess = () => {
    // Refresh the schedule after new maintenance is created
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Maintenance Schedule
          </CardTitle>
          <ScheduleMaintenanceDialog onSuccess={handleScheduleSuccess}>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New
            </Button>
          </ScheduleMaintenanceDialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : schedule.length > 0 ? (
          <div className="space-y-4">
            {schedule.map((item, index) => (
              <MaintenanceItem key={`${item.assetId}-${index}`} {...item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No maintenance scheduled</p>
            <p className="text-xs">
              Click "Schedule New" to add maintenance tasks
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
