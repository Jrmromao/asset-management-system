import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React, { useTransition, useState } from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import CO2Dialog from "@/components/dialogs/CO2Dialog";
import { Co2eRecord } from "@prisma/client";
import { CO2CalculationResult } from "@/types/co2";
import { Asset } from "@/types/asset";

// const navigate = useRouter() cannot use hook in a non hook component
interface AssetColumnsProps {
  onDelete: (value: Asset) => void;
  onView: (value: Asset) => void;
}

const CO2FootprintCell = ({ row }: { row: any }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [calculationResult, setCalculationResult] =
    useState<CO2CalculationResult | null>(null);
  const [isNewCalculation, setIsNewCalculation] = useState(false);
  const record = row.original.co2eRecords?.sort(
    (a: Co2eRecord, b: Co2eRecord) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  const openDialog = (result: CO2CalculationResult, isNew: boolean) => {
    setCalculationResult(result);
    setIsNewCalculation(isNew);
    setDialogOpen(true);
  };

  const handleCalculate = (assetId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/co2/calculate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assetId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Use the complete data directly from API route
          openDialog(result.data, true);
        } else {
          toast({
            title: "CO2 Calculation Failed",
            description: result.error || "An unknown error occurred.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSaveResult = (result: CO2CalculationResult) => {
    // The result is already saved by the action, just refresh the page
    router.refresh();
    setDialogOpen(false);
  };

  const getImpactLevel = (value: number, unit: string) => {
    // Convert everything to kg for comparison
    const normalizedValue = unit.toLowerCase().includes("ton")
      ? value * 1000 // Convert tonnes/tons to kg
      : value; // Already in kg

    if (normalizedValue > 1000) {
      return {
        color: "bg-red-500",
        label: "High Impact",
      };
    } else if (normalizedValue > 500) {
      return {
        color: "bg-yellow-500",
        label: "Medium Impact",
      };
    }
    return {
      color: "bg-green-500",
      label: "Low Impact",
    };
  };

  return (
    <>
      {record ? (
        <div
          className="group relative flex items-center gap-2 cursor-pointer"
          onClick={() => {
            let resultToShow: CO2CalculationResult;
            if (record.details) {
              try {
                const details = JSON.parse(record.details as string);
                resultToShow = {
                  totalCo2e: details.totalCo2e || Number(record.co2e),
                  units: details.units || record.units,
                  confidenceScore: details.confidenceScore || 0.5,
                  lifecycleBreakdown: details.lifecycleBreakdown || {
                    manufacturing: "N/A",
                    transport: "N/A",
                    use: "N/A",
                    endOfLife: "N/A",
                  },
                  sources: details.sources || [],
                  description:
                    details.description || (record as any).description || "",
                  scopeBreakdown: details.scopeBreakdown || {
                    scope1: { total: 0, categories: {} },
                    scope2: {
                      total: 0,
                      locationBased: 0,
                      marketBased: 0,
                      electricity: 0,
                    },
                    scope3: { total: 0, categories: {} },
                  },
                  primaryScope: details.primaryScope || 3,
                  primaryScopeCategory:
                    details.primaryScopeCategory || "Unknown",
                  emissionFactors: details.emissionFactors || [],
                  methodology: details.methodology || "Historical data",
                  activityData: details.activityData || {},
                };
              } catch {
                resultToShow = {
                  totalCo2e: Number(record.co2e),
                  units: record.units,
                  confidenceScore: 0.5,
                  lifecycleBreakdown: {
                    manufacturing: "N/A",
                    transport: "N/A",
                    use: "N/A",
                    endOfLife: "N/A",
                  },
                  sources: [],
                  description: (record as any).description || "",
                  scopeBreakdown: {
                    scope1: { total: 0, categories: {} },
                    scope2: {
                      total: 0,
                      locationBased: 0,
                      marketBased: 0,
                      electricity: 0,
                    },
                    scope3: { total: 0, categories: {} },
                  },
                  primaryScope: 3,
                  primaryScopeCategory: "Unknown",
                  emissionFactors: [],
                  methodology: "Historical data",
                  activityData: {},
                };
              }
            } else {
              resultToShow = {
                totalCo2e: Number(record.co2e),
                units: record.units,
                confidenceScore: 0.5,
                lifecycleBreakdown: {
                  manufacturing: "N/A",
                  transport: "N/A",
                  use: "N/A",
                  endOfLife: "N/A",
                },
                sources: [],
                description: (record as any).description || "",
                scopeBreakdown: {
                  scope1: { total: 0, categories: {} },
                  scope2: {
                    total: 0,
                    locationBased: 0,
                    marketBased: 0,
                    electricity: 0,
                  },
                  scope3: { total: 0, categories: {} },
                },
                primaryScope: 3,
                primaryScopeCategory: "Unknown",
                emissionFactors: [],
                methodology: "Historical data",
                activityData: {},
              };
            }
            openDialog(resultToShow, false);
          }}
        >
          <div className="flex flex-col">
            <span className="font-medium">
              {Number(record.co2e).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <span className="text-gray-500 text-sm ml-1">{record.units}</span>
            </span>
            <span
              className={`text-xs ${
                getImpactLevel(Number(record.co2e), record.units).color ===
                "bg-yellow-500"
                  ? "text-yellow-800"
                  : "text-white"
              } px-1 rounded-sm ${
                getImpactLevel(Number(record.co2e), record.units).color
              }`}
            >
              {getImpactLevel(Number(record.co2e), record.units).label}
            </span>
          </div>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            Updated: {new Date(record.createdAt).toLocaleDateString()}
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCalculate(row.original.id)}
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Calculate
        </Button>
      )}
      {calculationResult && (
        <CO2Dialog
          isOpen={isDialogOpen}
          onClose={() => setDialogOpen(false)}
          assetId={row.original.id}
          assetName={row.original.name}
          initialResult={calculationResult}
          isNewCalculation={isNewCalculation}
          onSave={handleSaveResult}
        />
      )}
    </>
  );
};

export const assetColumns = ({
  onDelete,
  onView,
}: AssetColumnsProps): ColumnDef<Asset>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "assetTag",
    header: "Asset Tag",
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-gray-100 transition-colors duration-200 group flex items-center gap-2 px-3 py-2 rounded-md"
      >
        <span className="font-medium text-gray-700">Status</span>
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      return (
        <div className="flex items-center">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
              {
                "bg-green-100 text-green-800": status === "Available",
                "bg-yellow-100 text-yellow-800": status === "In Use",
                "bg-blue-100 text-blue-800": status === "In Repair",
                "bg-red-100 text-red-800": status === "Inactive",
                "bg-gray-100 text-gray-800": status === "Pending",
              },
            )}
          >
            {status}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "assigneeId",
    header: "Assigned",
    cell: ({ row }) => {
      const value = row.getValue("assigneeId") as string;
      return <div>{value ? "Yes" : "No"}</div>;
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      const value = row.getValue("model") as { name: string };
      return <div>{value?.name ?? "-"}</div>;
    },
  },
  {
    header: "CO2 Footprint",
    cell: ({ row }) => <CO2FootprintCell row={row} />,
  },
  {
    header: "Purchase Date",
    accessorKey: "purchaseDate",
    cell: ({ row }) => {
      const value = row.getValue("purchaseDate") as string;
      return (
        <div className="font-medium">
          {new Date(value).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const value = (row.original as any).model?.category?.name;
      return <LinkTableCell value={value} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onDelete={() => onDelete(row.original)}
        onView={() => onView(row.original)}
      />
    ),
  },
];
