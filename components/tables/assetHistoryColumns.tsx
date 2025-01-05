"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  CheckCircle2,
  CircleUserRound,
  HashIcon,
  Mail,
} from "lucide-react";

interface itemUseByColumnsProps {
  onView: (value: any) => void;
}

export const assetItemHistoryColumns =
  ({}: itemUseByColumnsProps): ColumnDef<AssetHistory>[] => [
    {
      accessorKey: "user.employeeId",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
          >
            <HashIcon className="w-4 h-4" />
            Employee ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-sm text-gray-600">test</div>;
      },
    },
    {
      accessorKey: "user.name",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
          >
            <CircleUserRound className="w-4 h-4" />
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-sm text-gray-900">test</div>;
      },
    },
    {
      accessorKey: "user.email",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
          >
            <Mail className="w-4 h-4" />
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div className="text-sm text-gray-900">test</div>;
      },
    },

    {
      id: "actions",
      enableSorting: false,
      header: () => (
        <div className="text-xs font-medium text-gray-500 uppercase text-center">
          Actions
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start gap-4 px-4">
            {true && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
