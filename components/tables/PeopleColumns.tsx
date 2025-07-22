import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import React from "react";
import DataTableRowActions from "@/components/tables/DataTable/DataTableRowActions";
import { User, Role, Department } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserWithRole = User & {
  role: Role;
  department?: Department;
};

export const peopleColumns = ({
  onDelete,
  onUpdate,
}: {
  onDelete: (user: UserWithRole) => void;
  onUpdate: (user: UserWithRole) => void;
}): ColumnDef<UserWithRole>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 font-medium"
        >
          Employee
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3 py-2">
          <Avatar className="h-8 w-8 border border-gray-200">
            <AvatarImage src={user.images || undefined} alt={user.name} />
            <AvatarFallback className="text-xs font-medium bg-gray-50">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-sm text-gray-900 truncate">{user.name}</span>
            <span className="text-xs text-gray-500 truncate">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title & ID",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const employeeId = row.original.employeeId;
      return (
        <div className="flex flex-col py-2">
          <span className="text-sm font-medium text-gray-900">{title || "—"}</span>
          {employeeId && (
            <span className="text-xs text-gray-500">ID: {employeeId}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      
      const getRoleVariant = (roleName: string) => {
        const name = roleName?.toLowerCase();
        if (name?.includes('admin') || name?.includes('super')) {
          return 'destructive' as const; // Red for admin roles
        }
        if (name?.includes('manager') || name?.includes('lead')) {
          return 'default' as const; // Blue for manager roles
        }
        if (name?.includes('user') || name?.includes('employee')) {
          return 'secondary' as const; // Gray for regular users
        }
        if (name?.includes('lonee')) {
          return 'outline' as const; // Outline for lonee
        }
        return 'outline' as const; // Default for other roles
      };
      
      return (
        <div className="py-2">
          <Badge 
            variant={getRoleVariant(role?.name)} 
            className="text-xs font-medium"
          >
            {role?.name || "—"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      const isActive = user.active;
      const status = user.status;
      
      const getStatusInfo = () => {
        if (!isActive) {
          return {
            label: "Inactive",
            variant: "secondary" as const,
          };
        }
        
        switch (status) {
          case 'ACTIVE':
            return {
              label: "Active",
              variant: "default" as const,
            };
          case 'INVITED':
            return {
              label: "Invited",
              variant: "outline" as const,
            };
          case 'DISABLED':
            return {
              label: "Disabled",
              variant: "destructive" as const,
            };
          default:
            return {
              label: "Unknown",
              variant: "secondary" as const,
            };
        }
      };
      
      const statusInfo = getStatusInfo();
      
      return (
        <div className="py-2">
          <Badge variant={statusInfo.variant} className="text-xs">
            {statusInfo.label}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formattedDate = date.toLocaleDateString();
      
      return (
        <div className="py-2">
          <span className="text-sm text-gray-600">{formattedDate}</span>
        </div>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        onDelete={() => onDelete(row.original)}
        onUpdate={() => onUpdate(row.original)}
      />
    ),
  },
];
