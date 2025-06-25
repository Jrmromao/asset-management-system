"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Pause, Edit, Trash2, Eye } from "lucide-react";
import { MaintenanceFlow } from "@/lib/actions/maintenanceFlow.actions";
import { formatDistanceToNow } from "date-fns";

interface MaintenanceFlowColumnsProps {
  onView?: (flow: MaintenanceFlow) => void;
  onEdit?: (flow: MaintenanceFlow) => void;
  onDelete?: (flow: MaintenanceFlow) => void;
  onToggleActive?: (flow: MaintenanceFlow) => void;
}

export const maintenanceFlowColumns = ({
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: MaintenanceFlowColumnsProps): ColumnDef<MaintenanceFlow>[] => [
  {
    accessorKey: "name",
    header: "Flow Name",
    cell: ({ row }) => {
      const flow = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {flow.name}
          </span>
          {flow.description && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {flow.description}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as number;
      const getPriorityLevel = (priority: number) => {
        if (priority > 300) return "HIGH";
        if (priority > 200) return "MEDIUM";
        return "LOW";
      };

      const getVariant = (level: string) => {
        switch (level) {
          case "HIGH":
            return "destructive";
          case "MEDIUM":
            return "default";
          case "LOW":
            return "outline";
          default:
            return "outline";
        }
      };

      const level = getPriorityLevel(priority);
      return (
        <Badge variant={getVariant(level)} className="capitalize">
          {level.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "trigger",
    header: "Trigger",
    cell: ({ row }) => {
      const trigger = row.getValue("trigger") as string;
      return (
        <Badge variant="outline" className="capitalize">
          {trigger.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "executionCount",
    header: "Executions",
    cell: ({ row }) => {
      const count = row.getValue("executionCount") as number;
      return (
        <div className="text-center">
          <span className="font-medium">{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "successRate",
    header: "Success Rate",
    cell: ({ row }) => {
      const rate = row.getValue("successRate") as number;
      const getColor = (rate: number) => {
        if (rate >= 90) return "text-green-600 dark:text-green-400";
        if (rate >= 70) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
      };

      return (
        <div className="text-center">
          <span className={`font-medium ${getColor(rate)}`}>
            {rate.toFixed(0)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "lastExecuted",
    header: "Last Executed",
    cell: ({ row }) => {
      const lastExecuted = row.getValue("lastExecuted") as Date | undefined;
      if (!lastExecuted) {
        return <span className="text-gray-500 dark:text-gray-400">Never</span>;
      }
      return (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDistanceToNow(new Date(lastExecuted), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as Date;
      return (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const flow = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onView && (
              <DropdownMenuItem onClick={() => onView(flow)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(flow)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Flow
              </DropdownMenuItem>
            )}
            {onToggleActive && (
              <DropdownMenuItem onClick={() => onToggleActive(flow)}>
                {flow.isActive ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(flow)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Flow
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
