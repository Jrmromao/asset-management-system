"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  CheckCircle2,
  CircleUserRound,
  HashIcon,
  Mail,
  User as UserIcon,
} from "lucide-react";

interface itemUseByColumnsProps {
  onView: (value: any) => void;
}

export const itemUseByColumns =
  ({}: itemUseByColumnsProps): ColumnDef<UserAccessory>[] => [
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
        const user = row.original.user;
        return <div className="text-sm text-gray-600">{user.employeeId}</div>;
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
        const user = row.original.user;
        return <div className="text-sm text-gray-900">{user.name}</div>;
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
        const user = row.original.user;
        return <div className="text-sm text-gray-900">{user.email}</div>;
      },
    },
    {
      accessorFn: (row) => row.user.active,
      id: "status",
      enableSorting: true,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase"
          >
            <UserIcon className="w-4 h-4" />
            Account Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-gray-500" />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {user.active ? "Active" : "Inactive"}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
        );
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
        const user = row.original.user;
        return (
          <div className="flex items-center justify-start gap-4 px-4">
            {user.active && (
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
