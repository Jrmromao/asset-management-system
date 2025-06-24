"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Calendar, 
  CheckCircle, 
  Play, 
  AlertTriangle, 
  Leaf,
  Clock,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow, format } from "date-fns";
import { useMaintenance } from "@/hooks/useMaintenance";
import { memo } from "react";

export type MaintenanceRow = {
  id: string;
  title: string;
  asset: {
    id: string;
    name: string;
    assetTag?: string;
    category?: {
      name: string;
    };
  };
  statusLabel: {
    name: string;
    colorCode?: string;
  };
  startDate: string;
  completionDate?: string;
  cost?: number;
  totalCost?: number;
  isWarranty: boolean;
  notes?: string;
  supplier?: {
    name: string;
  };
  co2eRecords?: Array<{
    co2e: number;
    units: string;
    co2eType: string;
    scope?: number;
    sourceOrActivity?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

// Memoized Status Badge Component
const StatusBadge = memo(({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "scheduled":
        return { className: "bg-blue-100 text-blue-800 border-0", dot: "bg-blue-500" };
      case "in progress":
        return { className: "bg-amber-100 text-amber-800 border-0", dot: "bg-amber-500" };
      case "completed":
        return { className: "bg-green-100 text-green-800 border-0", dot: "bg-green-500" };
      case "overdue":
        return { className: "bg-red-100 text-red-800 border-0", dot: "bg-red-500" };
      default:
        return { className: "bg-gray-100 text-gray-800 border-0", dot: "bg-gray-500" };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`${config.className} text-xs px-2 py-1 font-medium`}>
      <div className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5`} />
      {status}
    </Badge>
  );
});

StatusBadge.displayName = "StatusBadge";

// Memoized CO2 Display Component
const CO2Display = memo(({ co2eRecords }: { co2eRecords?: any[] }) => {
  if (!co2eRecords || co2eRecords.length === 0) {
    return <span className="text-xs text-gray-400">No data</span>;
  }

  const totalCO2 = co2eRecords.reduce((sum, record) => sum + Number(record.co2e), 0);
  
  const getColor = (co2e: number) => {
    if (co2e <= 5) return "text-green-600";
    if (co2e <= 15) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <Leaf className={`h-3 w-3 ${getColor(totalCO2)}`} />
            <span className={`text-sm font-medium ${getColor(totalCO2)}`}>
              {totalCO2.toFixed(1)}kg
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {co2eRecords.map((record, i) => (
              <div key={i}>{record.co2eType}: {Number(record.co2e).toFixed(1)}kg</div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

CO2Display.displayName = "CO2Display";

// Enhanced Actions Cell with Custom Hook Integration
const ActionsCell = memo(({ row }: { row: any }) => {
  const maintenance = row.original;
  const { updateStatus, deleteMaintenance, isUpdating, isDeleting } = useMaintenance();

  const handleStatusUpdate = async (newStatus: string) => {
    updateStatus(maintenance.id, newStatus);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      deleteMaintenance(maintenance.id);
    }
  };

  const isLoading = isUpdating || isDeleting;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0" 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {maintenance.statusLabel.name === "Scheduled" && (
          <>
            <DropdownMenuItem 
              onClick={() => handleStatusUpdate("In Progress")}
              disabled={isLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Start
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleStatusUpdate("Completed")}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {maintenance.statusLabel.name === "In Progress" && (
          <>
            <DropdownMenuItem 
              onClick={() => handleStatusUpdate("Completed")}
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          onClick={handleDelete} 
          className="text-red-600"
          disabled={isLoading}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

ActionsCell.displayName = "ActionsCell";

// Memoized Maintenance Title Cell
const MaintenanceTitleCell = memo(({ title, notes }: { title: string; notes?: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="max-w-[180px] cursor-help">
          <div className="font-medium text-sm truncate">{title}</div>
          {notes && (
            <div className="text-xs text-gray-500 truncate">{notes}</div>
          )}
        </div>
      </TooltipTrigger>
      {notes && (
        <TooltipContent>
          <div className="max-w-xs">
            <div className="font-medium">{title}</div>
            <div className="text-sm text-gray-600 mt-1">{notes}</div>
          </div>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
));

MaintenanceTitleCell.displayName = "MaintenanceTitleCell";

// Memoized Asset Cell
const AssetCell = memo(({ asset }: { asset: MaintenanceRow['asset'] }) => (
  <div className="max-w-[160px]">
    <div className="font-medium text-sm truncate">{asset.name}</div>
    <div className="flex items-center gap-2 mt-0.5">
      {asset.assetTag && (
        <span className="text-xs text-gray-500">#{asset.assetTag}</span>
      )}
      {asset.category && (
        <span className="text-xs text-blue-600">{asset.category.name}</span>
      )}
    </div>
  </div>
));

AssetCell.displayName = "AssetCell";

// Memoized Date Cell
const DateCell = memo(({ date, isOverdue = false }: { date: string; isOverdue?: boolean }) => {
  const dateObj = new Date(date);
  
  return (
    <div className="text-sm">
      <div className={isOverdue ? "text-red-600 font-medium" : "text-gray-900"}>
        {format(dateObj, "MMM dd, yyyy")}
      </div>
      <div className="text-xs text-gray-500">
        {formatDistanceToNow(dateObj, { addSuffix: true })}
      </div>
      {isOverdue && (
        <Badge variant="destructive" className="text-xs mt-1">
          Overdue
        </Badge>
      )}
    </div>
  );
});

DateCell.displayName = "DateCell";

// Memoized Cost Cell
const CostCell = memo(({ cost, totalCost, isWarranty }: { 
  cost?: number; 
  totalCost?: number; 
  isWarranty: boolean; 
}) => {
  const finalCost = totalCost || cost;
  
  if (isWarranty) {
    return (
      <div>
        <Badge className="bg-green-100 text-green-800 border-0 text-xs">
          Warranty
        </Badge>
        <div className="text-xs text-gray-500 mt-0.5">No cost</div>
      </div>
    );
  }
  
  return finalCost ? (
    <span className="text-sm font-medium">${Number(finalCost).toFixed(2)}</span>
  ) : (
    <span className="text-gray-400">-</span>
  );
});

CostCell.displayName = "CostCell";

export const maintenanceColumns: ColumnDef<MaintenanceRow>[] = [
  {
    accessorKey: "title",
    header: "Maintenance",
    cell: ({ row }) => {
      const { title, notes } = row.original;
      return <MaintenanceTitleCell title={title} notes={notes} />;
    },
  },
  {
    accessorKey: "asset.name",
    header: "Asset",
    cell: ({ row }) => <AssetCell asset={row.original.asset} />,
  },
  {
    accessorKey: "statusLabel.name",
    header: "Status",
    cell: ({ row }) => {
      const statusLabel = row.original.statusLabel;
      const startDate = new Date(row.original.startDate);
      const now = new Date();
      const isCompleted = row.original.completionDate;
      const status = statusLabel.name.toLowerCase();
      
      const isOverdue = startDate < now && !isCompleted && status !== "completed";
      
      return <StatusBadge status={isOverdue ? "Overdue" : statusLabel.name} />;
    },
  },
  {
    accessorKey: "startDate",
    header: "Scheduled",
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      const now = new Date();
      const isCompleted = row.original.completionDate;
      const status = row.original.statusLabel.name.toLowerCase();
      
      const isOverdue = new Date(startDate) < now && !isCompleted && status !== "completed";
      
      return <DateCell date={startDate} isOverdue={isOverdue} />;
    },
  },
  {
    accessorKey: "completionDate",
    header: "Completed",
    cell: ({ row }) => {
      const completionDate = row.getValue("completionDate") as string;
      if (!completionDate) {
        return (
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="h-3 w-3" />
            <span className="text-sm">Pending</span>
          </div>
        );
      }
      
      return <DateCell date={completionDate} />;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const { cost, totalCost, isWarranty } = row.original;
      return <CostCell cost={cost} totalCost={totalCost} isWarranty={isWarranty} />;
    },
  },
  {
    accessorKey: "co2eRecords",
    header: "CO₂ Impact",
    cell: ({ row }) => <CO2Display co2eRecords={row.original.co2eRecords} />,
  },
  {
    accessorKey: "supplier.name",
    header: "Supplier",
    cell: ({ row }) => {
      const supplier = row.original.supplier;
      return supplier ? (
        <span className="text-sm truncate max-w-[100px] block">{supplier.name}</span>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]; 