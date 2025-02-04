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
