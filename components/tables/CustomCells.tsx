import React from "react";
import { ArrowUpDown, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BooleanCell = ({ value }: { value: boolean }) => (
  <div className="flex items-center justify-center h-full">
    {value ? (
      <Check className="w-5 h-5 text-green-500" />
    ) : (
      <X className="w-5 h-5 text-red-500" />
    )}

    {value}
  </div>
);

export const SortableHeader = ({
  column,
  label,
}: {
  column: any;
  label: string;
}) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    className="hover:bg-transparent"
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

export const ColorCell = ({
  color,
  description,
}: {
  color: string;
  description?: string;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center">
      <div
        className="h-4 w-4 rounded-full border border-gray-200 shadow-sm mr-2"
        style={{
          backgroundColor: color as React.CSSProperties["backgroundColor"],
        }}
      />
      {description && (
        <span className="text-sm text-gray-500">{description}</span>
      )}
    </div>
  </div>
);

export const DateCell = ({ date }: { date: string }) => (
  <div className="text-sm text-gray-600 flex items-center justify-center h-full">
    {new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}
  </div>
);
