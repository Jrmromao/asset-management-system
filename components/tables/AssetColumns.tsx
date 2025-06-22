import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Loader2 } from "lucide-react";
import LinkTableCell from "@/components/tables/LinkTableCell";
import React, { useTransition, useState } from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { calculateAssetCO2Action } from "@/lib/actions/co2.actions";
import CO2Dialog from "@/components/dialogs/CO2Dialog";
import { Co2eRecord } from "@prisma/client";
import { CO2CalculationResult } from "@/types/co2";

// const navigate = useRouter() cannot use hook in a non hook component
interface AssetColumnsProps {
  onDelete: (value: Asset) => void;
  onView: (value: Asset) => void;
}

export const assetColumns = ({
  onDelete,
  onView,
}: AssetColumnsProps): ColumnDef<Asset>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gray-100 transition-colors duration-200 group flex items-center gap-2 px-3 py-2 rounded-md"
        >
          <span className="font-medium text-gray-700">Status</span>
        </Button>
      );
    },
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
      const value = row.getValue("model") as Model;

      return <div>{value?.name ?? "-"}</div>;
    },
  },
  {
    header: "CO2 Footprint",
    cell: ({ row }) => {
      const { toast } = useToast();
      const router = useRouter();
      const [isPending, startTransition] = useTransition();
      const [isDialogOpen, setDialogOpen] = useState(false);
      const [calculationResult, setCalculationResult] = useState<CO2CalculationResult | null>(null);
      const [isNewCalculation, setIsNewCalculation] = useState(false);
      const record = row.original.Co2eRecord?.[0];

      const openDialog = (result: CO2CalculationResult, isNew: boolean) => {
        setCalculationResult(result);
        setIsNewCalculation(isNew);
        setDialogOpen(true);
      };

      const handleCalculate = (assetId: string) => {
        startTransition(async () => {
          try {
            const result = await calculateAssetCO2Action(assetId);
            if (result.success && "data" in result && result.data) {
              const formattedData: CO2CalculationResult = {
                totalCo2e: result.data.totalCo2e || 0,
                units: result.data.units || "kgCO2e",
                confidenceScore: result.data.confidenceScore || 0.5,
                lifecycleBreakdown: result.data.lifecycleBreakdown || {
                  manufacturing: "N/A",
                  transport: "N/A",
                  use: "N/A",
                  endOfLife: "N/A"
                },
                sources: result.data.sources || [],
                description: result.data.description || ""
              };
              openDialog(formattedData, true);
            } else {
              toast({
                title: "CO2 Calculation Failed",
                description:
                  "error" in result && result.error
                    ? String(result.error)
                    : "An unknown error occurred.",
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
                      lifecycleBreakdown:
                        details.lifecycleBreakdown || {
                          manufacturing: "N/A",
                          transport: "N/A",
                          use: "N/A",
                          endOfLife: "N/A",
                        },
                      sources: details.sources || [],
                      description:
                        details.description || (record as any).description || "",
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
                  <span className="text-gray-500 text-sm ml-1">
                    {record.units}
                  </span>
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      getImpactLevel(Number(record.co2e), record.units).color
                    }`}
                  />
                  {getImpactLevel(Number(record.co2e), record.units).label}
                </div>
              </div>

              {/* Tooltip */}
              <div className="invisible group-hover:visible absolute top-full left-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-48">
                <p className="font-medium mb-1">CO2 Footprint Details</p>
                <p>
                  Value: {Number(record.co2e).toLocaleString()} {record.units}
                </p>
                {record.co2eType && <p>Type: {record.co2eType}</p>}
                {record.sourceOrActivity && (
                  <p>Source: {record.sourceOrActivity}</p>
                )}
                <p className="text-xs text-gray-300 mt-1">
                  Click to view details
                </p>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => handleCalculate(row.original.id)}
              disabled={isPending}
              size="sm"
              variant="outline"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                "Calculate CO2"
              )}
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
    },
  },
  {
    accessorKey: "serialNumber",
    header: "Serial Number",
  },
  {
    accessorKey: "statusLabel",
    header: "Status Label",
    cell: ({ row }) => {
      const value = row.getValue("statusLabel") as StatusLabel;
      return (
        <LinkTableCell value={value?.name} label={value} navigateTo={`#`} />
      );
    },
  },
  {
    accessorKey: "endOfLife",
    header: "Planned End of Life",
    cell: ({ row }) => {
      const value = new Date(row.getValue("endOfLife"));
      const formattedDate = value.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },

  {
    accessorKey: "category",
    header: "Category",

    cell: ({ row }) => {
      const value = row.original.formTemplate;
      return (
        <LinkTableCell
          className={"hover:underline"}
          value={row.original.name}
          navigateTo={`/assets/view/${row.original.id}`}
        />
      );
    },
  },

  // {
  //     accessorKey: "customForm",
  //     // header: "Custom Form",
  //     header: ({column}) => {
  //         return (
  //             <div className="flex gap-1">
  //                 <div className={``}>Custom form</div>
  //                 <div className={`w-3/12 `}>
  //                     <Popover>
  //                         <PopoverTrigger asChild>
  //                             <InfoIcon className="h-4 w-4 "/>
  //                         </PopoverTrigger>
  //                         <PopoverContent className={`bg-white p-4 text-2sm`}>
  //                             This asset has a custom form
  //                         </PopoverContent>
  //                     </Popover>
  //                 </div>
  //             </div>
  //
  //         )
  //     },
  //
  //     cell: ({row}) => {
  //         const value = row.original.formTemplate;
  //         return <LinkTableCell className={'hover:underline hover:text-red-500 hover:decoration-wavy'}
  //                               value={value?.name} navigateTo={`/assets/view/${row.original.id}`}/>
  //     },
  // }
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DataTableRowActions row={row} onDelete={onDelete} onView={onView} />
      );
    },
  },
];
